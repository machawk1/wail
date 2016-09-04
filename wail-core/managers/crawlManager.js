import autobind from 'autobind-decorator'
import cheerio from 'cheerio'
import _ from 'lodash'
import fs from 'fs-extra'
import join from 'joinable'
import moment from 'moment'
import os from 'os'
import path from 'path'
import Db from 'nedb'
import Promise from 'bluebird'
import S from 'string'
import {ipcRender, remote} from 'electron'
import util from 'util'
import {default as wc} from '../constants'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const pathMan = remote.getGlobal('pathMan')
const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

export default class CrawlManager {

  constructor () {
    this.db = new Db({
      filename: pathMan.join(settings.get('wailCore.db'), 'crawls'),
      autoload: true
    })
  }

  addJobDirectoryHeritrix (confPath) {
    let options = _.cloneDeep(settings.get('heritrix.addJobDirectoryOptions'))
    options.form.addPath = confPath
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.ADD_HERITRIX_JOB_DIRECTORY,
      opts: options,
      from: `addJobToHeritrix[${confPath}]`,
      timeReceived: null
    }
  }

  buildHeritrixJob (jobId) {
    let options = _.cloneDeep(settings.get('heritrix.buildOptions'))
    console.log('options url before setting', options.url)
    options.url = `${options.url}${jobId}`
    console.log(options)
    console.log('options url before setting', options.url)
    // options.agent = httpsAgent
    console.log(`building heritrix job ${jobId}`)
    console.log('Options after setting options.url', options.url)
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.BUILD_HERITIX_JOB,
      opts: options,
      from: `buildHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null
    }
  }

  *deleteHeritrixJob (jobId) {
    yield* this.forceCrawlFinish(jobId)
  }

  extractUrlsFromConf (confPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(confPath, 'utf8', (err, confText) => {
        if (err) {
          reject(err)
        } else {
          let doc = cheerio.load(confText, {
            xmlMode: true
          })
          let urlElemText = S(doc('bean[id="longerOverrides"]').find('prop[key="seeds.textSource.value"]').text().trim())
          let maybeMultiple = urlElemText.lines()
          resolve(maybeMultiple.length > 1 ? maybeMultiple : maybeMultiple[ 0 ])
        }
      })
    })
  }

  @autobind
  *forceCrawlFinish (jobId) {
    yield this.teardownJob(jobId)
    yield this.terminateJob(jobId)
  }

  launchHeritrixJob (jobId) {
    let options = _.cloneDeep(settings.get('heritrix.launchJobOptions'))
    console.log('options url before setting', options.url)
    console.log('the jobid', jobId)
    options.url = `${options.url}${jobId}`
    console.log(`launching heritrix job ${jobId}`)
    console.log('Options after setting options.url', options.url)
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.LAUNCH_HERITRIX_JOB,
      opts: options,
      from: `launchHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null,
    }
  }

  @autobind
  *crawlSequance (jobId, confPath) {
    yield  this.addJobDirectoryHeritrix(confPath)
    yield  this.buildHeritrixJob(jobId)
    yield  this.launchHeritrixJob(jobId)
    yield* this.forceCrawlFinish(jobId)
  }

  @autobind
  crawlStarted (jobId) {
    return new Promise((resolve, reject) => {
      this.db.update({ jobId }, { $set: { crawlStarted: true } }, {}, (error, updated) => {
        if (error) {
          reject(error)
        } else {
          resolve(updated)
        }
      })
    })
  }

  @autobind
  crawlEnded (jobId) {
    return new Promise((resolve, reject) => {
      this.db.update({ jobId }, { $set: { crawlStarted: false } }, {}, (error, updated) => {
        if (error) {
          reject(error)
        } else {
          resolve(updated)
        }
      })
    })
  }

  @autobind
  areCrawlsRunning () {
    return new Promise((resolve, reject) => {
      this.db.find({ crawlStarted: true }, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          let areRunning = docs.length > 0
          resolve(areRunning)
        }
      })
    })
  }

  /**
   * @param {Object} options
   * @param {ArchiveManager} archiveMan
   * @returns {Promise|Promise<Object>}
   */
  makeDefaultCrawlConf (options, archiveMan) {
    return new Promise((resolve, reject) => {
      let {
        urls,
        forCol,
        jobId
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
          let confPath = pathMan.join(settings.get('heritrixJob'), jobId)
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
                    id: jobId,
                    path: confPath,
                    urls: urls
                  }
                  ipcRender.send('made-heritrix-jobconf', Object.assign({}, crawlInfo, { forCol }))
                  this.db.insert({ jobId, _id: jobId, started: false, forCol }, (iError, doc) => {
                    if (iError) {
                      console.error(iError)
                    }
                    archiveMan.addCrawlInfo(forCol, crawlInfo)
                      .then((updated) => {
                        resolve({
                          wasError: false,
                          crawlInfo
                        })
                      })
                      .catch((error) => {
                        resolve({
                          error,
                          wasError: true,
                          crawlInfo
                        })
                      })
                  })
                }
              })
            }
          })
        }
      })
    })
  }

  @autobind
  moveWarc (jobId) {

  }

  rescanJobDir () {
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.RESCAN_JOB_DIR,
      from: 'rescanJobDir',
      opts: settings.get('heritrix.reScanJobs'),
      jId: 666,
      timeReceived: null,
    }
  }

  @autobind
  *restartJob (jobId) {
    yield  this.buildHeritrixJob(jobId)
    yield  this.launchHeritrixJob(jobId)
    yield* this.forceCrawlFinish(jobId)
  }

  teardownJob (jobId) {
    let teardown = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
    teardown.url = `${teardown.url}${jobId}`
    teardown.form.action = 'teardown'
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.TEARDOWN_JOB,
      opts: teardown,
      from: `tearDownJob[${jobId}]`,
      jId: jobId,
      timeReceived: null,
    }
  }

  terminateJob (jobId) {
    let teardown = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
    teardown.url = `${teardown.url}${jobId}`
    teardown.form.action = 'teardown'
    return {
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.TERMINATE_JOB,
      opts: teardown,
      from: `terminateJob[${jobId}]`,
      jId: jobId,
      timeReceived: null,
    }
  }

}