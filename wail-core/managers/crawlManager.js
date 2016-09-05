import autobind from 'autobind-decorator'
import cheerio from 'cheerio'
import Db from 'nedb'
import { default as wc } from '../constants'
import _ from 'lodash'
import fs from 'fs-extra'
import { ipcRenderer as ipc, remote } from 'electron'
import join from 'joinable'
import moment from 'moment'
import os from 'os'
import path from 'path'
import Promise from 'bluebird'
import S from 'string'
import util from 'util'
import CrawlStatsMonitor from './crawlStatsMonitor'
import { CrawlInfo } from '../util'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const pathMan = remote.getGlobal('pathMan')
const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

export default class CrawlManager {

  constructor () {
    this.db = new Db({
      filename: pathMan.join(settings.get('wailCore.db'), 'crawls.db'),
      autoload: true
    })
    this.csMonitor = new CrawlStatsMonitor()
    this.csMonitor.on('crawljob-status-update', update => {
      console.log('crawljob-status-update', update)
      ipc.send('crawljob-status-update', update)
    })
    this.csMonitor.on('crawljob-status-ended', update => {
      console.log('crawljob-status-ended', update)
      ipc.send('crawljob-status-update', update)
      this.crawlEnded(update)
    })
  }

  @autobind
  getAllRuns () {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          if (docs.length > 0) {
            docs = docs.map(r => new CrawlInfo(...r))
          }
          resolve(docs)
        }
      })
    })
  }

  @autobind
  crawlStarted (jobId) {
    this.db.update({ jobId }, { $set: { running: true } }, { returnUpdatedDocs: true }, (error, numUpdated, updated) => {
      this.csMonitor.startMonitoring(updated.path, jobId)
      if (error) {
        console.error('error inserting document', error)
      } else {
        console.log(`updated job ${jobId} it has started`, updated)
      }
    })
  }

  @autobind
  crawlEnded (update) {
    let theUpdate = {
      $set: { running: false },
      $push: {
        runs: {
          ended: update.ended,
          timestamp: update.timestamp,
          discovered: update.discovered,
          queued: update.queued,
          downloaded: update.downloaded
        }
      }
    }
    this.db.update({ jobId: update.id }, theUpdate, { returnUpdatedDocs: true }, (error, numUpdated, updated) => {
      if (error) {
        console.error('error updating document', update, error)
      } else {
        console.error('updated document', updated)
      }
    })
  }

  @autobind
  areCrawlsRunning () {
    return new Promise((resolve, reject) => {
      this.db.count({ running: true }, (err, runningCount) => {
        if (err) {
          reject(err)
        } else {
          let areRunning = runningCount > 0
          resolve(areRunning)
        }
      })
    })
  }

  /**
   * @param {Object} options
   * @returns {Promise|Promise<Object>}
   */
  makeCrawlConf (options) {
    return new Promise((resolve, reject) => {
      let {
        urls,
        forCol,
        jobId,
        depth
      } = options
      fs.readFile(settings.get('heritrix.jobConf'), 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          console.log(data)
          let doc = cheerio.load(data, {
            xmlMode: true
          })
          if (!jobId) {
            jobId = new Date().getTime()
          }
          let urlConf = doc('bean[id="longerOverrides"]').find('prop[key="seeds.textSource.value"]')
          let urlText
          if (Array.isArray(urls)) {
            console.log('array')
            urlText = `${os.EOL}${urls.join(os.EOL)}${os.EOL}`
          } else {
            urlText = `${os.EOL}${urls}${os.EOL}`
          }
          urlConf.text(urlText)
          let maxHops = doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').find('property[name="maxHops"]')
          maxHops.attr('value', `${depth}`)
          let confPath = pathMan.join(settings.get('heritrixJob'), `${jobId}`)
          fs.ensureDir(confPath, er => {
            if (er) {
              reject(er)
            } else {
              fs.writeFile(pathMan.join(confPath, 'crawler-beans.cxml'), doc.xml(), 'utf8', error => {
                if (error) {
                  console.log('done writting file with error', error)
                } else {
                  console.log('done writting file')
                  let crawlInfo = {
                    jobId,
                    path: pathMan.join(settings.get('heritrixJob'), `${jobId}`),
                    confP: confPath,
                    urls: urls,
                    running: false,
                    forCol
                  }
                  ipc.send('made-heritrix-jobconf', crawlInfo)
                  this.db.insert(Object.assign({}, { _id: `${jobId}`, runs: [] }, crawlInfo), (iError, doc) => {
                    if (iError) {
                      console.error(iError)
                      resolve({
                        crawlInfo,
                        wasError: true,
                        iError
                      })
                    } else {
                      resolve({
                        wasError: false,
                        crawlInfo
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
  }
}