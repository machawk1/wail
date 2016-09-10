import autobind from 'autobind-decorator'
import cheerio from 'cheerio'
import Db from 'nedb'
import {default as wc} from '../constants'
import _ from 'lodash'
import fs from 'fs-extra'
import {ipcRenderer as ipc, remote} from 'electron'
import join from 'joinable'
import moment from 'moment'
import os from 'os'
import path from 'path'
import Promise from 'bluebird'
import S from 'string'
import util from 'util'
import CrawlStatsMonitor from './crawlStatsMonitor'
import {CrawlInfo} from '../util'

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
          console.log(docs)
          if (docs.length > 0) {
            docs = docs.map(r => new CrawlInfo(r))
          }
          resolve(docs)
        }
      })
    })
  }

  @autobind
  crawlStarted (jobId) {
    this.db.update({ jobId }, { $set: { running: true } }, { returnUpdatedDocs: true }, (error, numUpdated, updated) => {
      if (error) {
        console.error('error inserting document', error)
        ipc.send('managers-error',{
          where: 'crawlStarted insert',
          error
        })
      } else {
        this.csMonitor.startMonitoring(updated.path, jobId)
        console.log(`updated job ${jobId} it has started`, updated)
      }
    })
  }

  @autobind
  crawlEnded (update) {
    console.log(update)
    let theUpdate = {
      $set: { running: false },
      $push: {
        runs: {
          started: update.stats.started,
          ended: update.stats.ended,
          timestamp: update.stats.timestamp,
          discovered: update.stats.discovered,
          queued: update.stats.queued,
          downloaded: update.stats.downloaded
        }
      }
    }
    this.db.update({ jobId: update.jobId }, theUpdate, { returnUpdatedDocs: true }, (error, numUpdated, updated) => {
      if (error) {
        console.error('error updating document', update, error)
      } else {
        console.log('updated document', numUpdated,updated)
        let {
          forCol
        } = updated[0]
        ipc.send('add-warcs-to-col',{forCol,warcs: pathMan.normalizeJoin(updated.path,'latest','warcs/*.warc')})

      }
    })
  }

  @autobind
  areCrawlsRunning () {
    console.log('checking if crawls are running')
    return new Promise((resolve, reject) => {
      this.db.count({ running: true }, (err, runningCount) => {
        if (err) {
          console.error('error finding if crawls are running')
          reject(err)
        } else {
          console.log('are crawls running',runningCount)
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
              let cfp = pathMan.join(confPath, 'crawler-beans.cxml')
              fs.writeFile(cfp, doc.xml(), 'utf8', error => {
                if (error) {
                  console.log('done writting file with error', error)
                  reject(error)
                } else {
                  console.log('done writting file')
                  let crawlInfo = {
                    depth,
                    jobId,
                    path: pathMan.join(settings.get('heritrixJob'), `${jobId}`),
                    confP: cfp,
                    urls: urls,
                    running: false,
                    forCol
                  }
                  let wRuns = Object.assign({}, { _id: `${jobId}`, runs: [] }, crawlInfo)
                  ipc.send('made-heritrix-jobconf', wRuns)
                  this.db.insert(wRuns, (iError, doc) => {
                    if (iError) {
                      console.error(iError)
                      reject(iError)
                    } else {
                      resolve(crawlInfo)
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