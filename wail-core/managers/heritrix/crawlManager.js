import cheerio from 'cheerio'
import Db from 'nedb'
import wc from '../../../wail-ui/constants/wail-constants'
import _ from 'lodash'
import fs from 'fs-extra'
import { ipcRenderer as ipc, remote } from 'electron'
import moment from 'moment'
import os from 'os'
import path from 'path'
import Promise from 'bluebird'
import S from 'string'
import Settings from '../../remoteSettings'
import CrawlStatsMonitor from './crawlStatsMonitor'
import { CrawlInfo } from '../../util'
import { readFile, ensureDirAndWrite } from '../../util/fsHelpers'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = new Settings()
settings.configure()
const pathMan = remote.getGlobal('pathMan')

export default class CrawlManager {
  constructor () {
    this.db = new Db({
      filename: path.join(settings.get('wailCore.db'), 'crawls.db'),
      autoload: true
    })
    this.csMonitor = new CrawlStatsMonitor()
    this.csMonitor.on('crawljob-status-update', update => {
      console.log('crawljob-status-update', update)
      ipc.send('crawljob-status-update', update)
    })
    this.csMonitor.on('crawljob-status-ended', ::this.onCrawlEnd)
    this.csMonitor.on('stopped-monitoring', (stopped) => {
      console.log(stopped)
    })
    this.launchId = /^[0-9]+$/
  }

  onCrawlEnd (update) {
    console.log('crawljob-status-ended', update)
    let newUpdate = _.cloneDeep(update)
    delete newUpdate.warcs

    ipc.send('send-to-requestDaemon', {
      type: wc.HeritrixRequestTypes.TERMINATE_JOB,
      jobId: update.jobId
    })
    ipc.send('crawljob-status-update', newUpdate)
    this.crawlEnded(update)
  }

  initialLoad () {
    return this.getAllRuns()
  }

  moveWarc (forCol, jobPath) {
    fs.readdir(jobPath, (err, files) => {
      // really abuse js evaluation of integers as strings
      // heritrix launch ids are dates in YYYYMMDD... basically an integer
      // so babel will make this Math.max.apply(Math,array)
      let latestLaunch = Math.max(...files.filter(item => this.launchId.test(item)))
      let warcPath = path.join(jobPath, `${latestLaunch}`, 'warcs', '*.warc')
      ipc.send('add-warcs-to-col', {forCol, warcs: warcPath})
    })
  }

  getAllRuns () {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          console.log(docs)
          let pDocs = docs
          if (pDocs.length > 0) {
            pDocs = _.orderBy(pDocs.map(r => new CrawlInfo(r)), ['jobId'], ['desc'])
          }
          resolve(pDocs)
        }
      })
    })
  }

  crawlStarted (jobId) {
    this.db.update({jobId}, {$set: {running: true}}, {returnUpdatedDocs: true}, (error, numUpdated, updated) => {
      if (error) {
        console.error('error inserting document', error)
        ipc.send('managers-error', {
          title: 'Error',
          level: 'error',
          message: `There was an error during adding the job ${jobId} to it collection collection`,
          uid: `There was an error during adding the job ${jobId} to it collection collection`,
          autoDismiss: 0
        })
      } else {
        this.csMonitor.startMonitoring(updated.path, jobId)
        console.log(`updated job ${jobId} it has started`, updated)
      }
    })
  }

  crawlEnded (update) {
    console.log(update)
    let theUpdate = {
      $set: {
        hasRuns: true,
        running: false,
        latestRun: {
          started: update.stats.started,
          ended: update.stats.ended,
          timestamp: update.stats.timestamp,
          discovered: update.stats.discovered,
          queued: update.stats.queued,
          downloaded: update.stats.downloaded
        }
      }
    }
    this.db.update({jobId: update.jobId}, theUpdate, {returnUpdatedDocs: true}, (error, numUpdated, updated) => {
      if (error) {
        console.error('error updating document', update, error)
        ipc.send('managers-error', {
          title: 'Error',
          level: 'error',
          message: `There was an error during updating the job ${updated.jobId} for collection ${updated.forCol}. Please manually add the WARC(s) produced by this crawl ${update.stats.warcs}.`,
          uid: `There was an error during updating the job ${updated.jobId} for collection ${updated.forCol}. Please manually add the WARC(s) produced by this crawl ${update.stats.warcs}.`,
          autoDismiss: 0
        })
      } else {
        console.log('updated document', numUpdated, updated)
        ipc.send('add-warcs-to-col', {
          col: updated.forCol,
          warcs: update.stats.warcs,
          lastUpdated: update.stats.timestamp,
          seed: {url: updated.urls, jobId: update.jobId}
        })
      }
    })
  }

  areCrawlsRunning () {
    console.log('checking if crawls are running')
    return new Promise((resolve, reject) => {
      this.db.count({running: true}, (err, runningCount) => {
        if (err) {
          console.error('error finding if crawls are running')
          reject(err)
        } else {
          console.log('are crawls running', runningCount)
          let areRunning = runningCount > 0
          resolve(areRunning)
        }
      })
    })
  }

  _insert (data) {
    return new Promise((resolve, reject) => {
      this.db.insert(data, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  makeCrawlConf2 (options) {
    let {urls, forCol, jobId, depth} = options
    return fs.readFile(settings.get('heritrix.jobConf'), 'utf8').then(data => {
      let doc = cheerio.load(data, {xmlMode: true})
      if (!jobId) {
        jobId = new Date().getTime()
      }
      let urlConf = doc('bean[id="longerOverrides"]').find('prop[key="seeds.textSource.value"]')
      let urlText
      if (Array.isArray(urls)) {
        urlText = `${os.EOL}${urls.join(os.EOL)}${os.EOL}`
      } else {
        urlText = `${os.EOL}${urls}${os.EOL}`
      }
      urlConf.text(urlText)
      let maxHops = doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').find('property[name="maxHops"]')
      maxHops.attr('value', `${depth}`)
      let confPath = path.join(settings.get('heritrix.jobsDir'), `${jobId}`)
      let cfp = path.join(confPath, 'crawler-beans.cxml')
      return fs.ensureDir(confPath).then(() =>
        fs.writeFile(cfp, doc.xml(), 'utf8').then(() => {
          let crawlInfo = {
            depth,
            jobId,
            latestRun: {
              ending: false,
              started: false,
              ended: true,
              timestamp: jobId,
              discovered: 0,
              queued: 0,
              downloaded: 0
            },
            path: path.join(settings.get('heritrix.jobsDir'), `${jobId}`),
            confP: cfp,
            urls: urls,
            running: false,
            forCol
          }
          // {"url":"http://cs.odu.edu","jobIds":[1473098189935],"mementos":1,"added":"2016-09-05T13:56:29-04:00","lastUpdated":"2016-09-16T00:12:16-04:00"}
          let lastUpdated = moment(jobId).format()
          ipc.send('made-heritrix-jobconf', {
            forMain: {
              crawlInfo,
              jobId
            },
            forArchives: {
              forCol,
              lastUpdated,
              seed: {forCol, url: urls, jobIds: [jobId], lastUpdated, added: lastUpdated, mementos: 0}
            }
          })
          return this._insert({_id: `${jobId}`, ...crawlInfo}).then(() => crawlInfo)
        }))
    })
  }

  /**
   * Creates a new crawler-beans.cxml(heritrix crawl config)
   * @param {Object} options
   * @returns {Promise|Promise<Object>}
   */
  makeCrawlConf (options) {
    let {urls, forCol, jobId, depth} = options
    return new Promise((resolve, reject) =>
      readFile(settings.get('heritrix.jobConf'))
        .then(data => {
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
          let confPath = pathMan.join(settings.get('heritrix.jobsDir'), `${jobId}`)
          let cfp = pathMan.join(confPath, 'crawler-beans.cxml')
          return ensureDirAndWrite(confPath, cfp, doc.xml())
            .then(() => {
              console.log('done writting file')
              let crawlInfo = {
                depth,
                jobId,
                latestRun: {
                  ending: false,
                  started: false,
                  ended: true,
                  timestamp: jobId,
                  discovered: 0,
                  queued: 0,
                  downloaded: 0
                },
                path: pathMan.join(settings.get('heritrix.jobsDir'), `${jobId}`),
                confP: cfp,
                urls: urls,
                running: false,
                forCol
              }
              // {"url":"http://cs.odu.edu","jobIds":[1473098189935],"mementos":1,"added":"2016-09-05T13:56:29-04:00","lastUpdated":"2016-09-16T00:12:16-04:00"}
              let lastUpdated = moment(jobId).format()
              ipc.send('made-heritrix-jobconf', {
                forMain: {
                  crawlInfo,
                  jobId
                },
                forArchives: {
                  forCol,
                  lastUpdated,
                  seed: {forCol, url: urls, jobIds: [jobId], lastUpdated, added: lastUpdated, mementos: 0}
                }
              })

              this.db.insert({_id: `${jobId}`, ...crawlInfo}, (iError, doc) => {
                if (iError) {
                  console.error(iError)
                  reject(iError)
                } else {
                  resolve(crawlInfo)
                }
              })
            })
            .catch(error => {
              console.error(`Error ${error.where}`, error.err)
              reject(error.err)
            })
        })
        .catch(errorRead => {
          reject(errorRead)
        })
    )
  }

  removeCrawl (jobId) {
    this.db.remove({_id: `${jobId}`}, (err, numRemoved) => {
      if (err) {
        console.error(`Could not remove crawl for ${jobId}`, err)
        ipc.send('managers-error', {
          wasError: true,
          err: err,
          message: {
            title: 'Error',
            level: 'error',
            message: `There was an internal error permanently removing the crawl for jobId[${jobId}]`,
            uid: `There was an internal error permanently removing the crawl for jobId[${jobId}]`,
            autoDismiss: 0
          }
        })
      } else {
        console.log(`Removed crawl for ${jobId}`, numRemoved)
      }
    })
  }

  stopMonitoringJob (jobId) {
    this.csMonitor.stopMonitoring(jobId)
  }
}
