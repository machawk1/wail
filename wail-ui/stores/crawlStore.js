import EventEmitter from 'eventemitter3'
import {ipcRenderer as ipc, remote} from 'electron'
import _ from 'lodash'
import S from 'string'
import {joinStrings} from 'joinable'
import os from 'os'
import autobind from 'autobind-decorator'
import UrlStore from '../stores/urlStore'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import MementoDispatcher from '../dispatchers/memgatorDispatcher'
import EditorDispatcher from '../dispatchers/editorDispatcher'
import wailConstants from '../constants/wail-constants'
import {readCode} from '../actions/editor-actions'
import {CrawlInfo, RunInfo} from '../../wail-core'
import {
  getHeritrixJobsState,
  makeHeritrixJobConf,
  buildHeritrixJob,
  launchHeritrixJob,
  teardownJob
} from '../actions/heritrix-actions'


const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

class CrawlStore_ extends EventEmitter {
  constructor () {
    super()
    this.crawlJobs = []
    this.jobIndex = new Map()

    // ipc.send('get-all-runs')/
    ipc.on('got-all-runs',this.intialJobStateLoad)
    ipc.on('made-heritrix-jobconf', (event, conf) => {
      console.log('made-heritrix-jobconf')
      this.createJob(conf)
    })
    ipc.on('crawljob-status-update', (event, crawlStatus) => this.crawlJobUpdate(crawlStatus))
    ipc.on('crawljob-configure-dialogue', (event, newCrawl) => {
      // console.log('got crawljob configured')
      // console.log(newCrawl)
      let forMTI
      let urls
      let maybeArray = Array.isArray(newCrawl.urls)
      if (maybeArray) {
        forMTI = joinStrings(...newCrawl.urls, { separator: ' ' })
        urls = `Urls: ${forMTI} With depth of ${newCrawl.depth}`
      } else {
        forMTI = newCrawl.urls
        urls = `${newCrawl.urls} with depth of ${newCrawl.depth}`
      }
      let jId = new Date().getTime()
      // MementoDispatcher.dispatch({
      //   type: EventTypes.BUILD_CRAWL_JOB,
      //   urls: forMTI,
      //   maybeArray,
      //   jId
      // })
      ipc.send('makeHeritrixJobConf', { urls: newCrawl.urls, depth: newCrawl.depth, jobId: jId, forCol: 'Wail' })
      // makeHeritrixJobConf(newCrawl.urls, newCrawl.depth, jId)

      GMessageDispatcher.dispatch({
        type: EventTypes.QUEUE_MESSAGE,
        message: `Building Heritrix crawl for ${urls}`
      })
    })
  }

  @autobind
  intialJobStateLoad (event, allRuns) {
    console.log(allRuns)
    this.jobIndex.clear()
    if (!allRuns.wasError) {
      if ( (allRuns.runs || [] ).length > 0) {
        let {
          runs
        } = allRuns
        this.crawlJobs = runs.map((r,idx) => {
          console.log(r)
          this.jobIndex.set(r.jobId,idx)
          return new CrawlInfo(r)
        })
        this.emit('jobs-updated')
      } else {
        console.log('there was no runs in the db')
      }

    } else {
      console.error('getting all runs had an error ',allRuns.error)
    }

    // console.log('initial load of crawl store')
    // getHeritrixJobsState()
      // .then(status => {
      //   // console.log(status)
      //   if (status.count > 0) {
      //     EditorDispatcher.dispatch({
      //       type: EventTypes.STORE_HERITRIX_JOB_CONFS,
      //       confs: status.confs
      //     })
      //     this.jobIndex.clear()
      //     status.jobs.forEach((jrb, idx) => {
      //       this.jobIndex.set(jrb.jobId, idx)
      //     })
      //     // console.log(status.jobs)
      //     this.crawlJobs = status.jobs
      //     this.emit('jobs-updated')
      //   }
      // })
      // .catch(error => {
      //   console.log('There was an error in getting the configs', error)
      // })
  }

  @autobind
  createJob (conf) {
    this.crawlJobs.push(conf)
    let idx = this.crawlJobs.length === 0 ? 0 : this.crawlJobs.length - 1
    this.jobIndex.set(conf.jobId.toString(), idx)
    this.crawlJobs[idx] = new CrawlInfo(conf)
    this.emit('jobs-updated')
  }

  // @autobind
  // createJob (id, pth, urls) {
  //   this.crawlJobs.push({
  //     jobId: id.toString(),
  //     path: pth,
  //     runs: [],
  //     urls: urls,
  //     crawlBean: readCode(`${settings.get('heritrixJob')}/${id.toString()}/crawler-beans.cxml`)
  //   })
  //   let idx = this.crawlJobs.length === 0 ? 0 : this.crawlJobs.length - 1
  //   this.jobIndex.set(id.toString(), idx)
  //   this.emit('jobs-updated')
  // }

  @autobind
  crawlJobUpdate (crawlStatus) {
    console.log('crawl status update', crawlStatus)
    let {
      jobId,
      stats
    } = crawlStatus
    if (stats.ended) {
      teardownJob(jobId)
    }
    console.log(this.jobIndex,this.crawlJobs)
    let jobIdx = this.jobIndex.get(jobId)
    let runs = ( this.crawlJobs[ jobIdx ].runs || [])
    if (runs.length > 0) {
      if(runs[0].started === stats.started) {
        runs[0].update(stats)
      } else {
        runs.unshift(new RunInfo(stats,jobId))
      }
    } else {
      runs.push(new RunInfo(stats,jobId))
    }
    this.crawlJobs[jobIdx].runs = runs

    this.emit(`${jobId}-updated`,runs[0])
    // })
    // let updated = []
    // jobs.jobs.forEach(job => {
    //   let jobIdx = this.jobIndex.get(job.jobId)
    //   // if the job has ended and our previous state says we have not
    //   // teardown the job so that we the operations we provide can happen no worry
    //   if (this.crawlJobs[ jobIdx ].runs.length > 0) {
    //     if (!this.crawlJobs[ jobIdx ].runs[ 0 ].ended && job.runs[ 0 ].ended) {
    //       teardownJob(job.jobId)
    //     }
    //   }
    //   this.crawlJobs[ jobIdx ].runs = job.runs
    //   this.crawlJobs[ jobIdx ].log = job.log
    //   this.crawlJobs[ jobIdx ].launch = job.launch
    //   this.crawlJobs[ jobIdx ].logPath = job.logPath
    //   updated.push(job.jobId)
    // })
    // updated.forEach(updatedJob => {
    //   this.emit(`${updatedJob}-updated`)
    // })
  }

  // @autobind
  // crawlJobUpdate (jobs) {
  //   console.log('building jobs from job monitor', jobs.jobs)
  //   let updated = []
  //   jobs.jobs.forEach(job => {
  //     let jobIdx = this.jobIndex.get(job.jobId)
  //     // if the job has ended and our previous state says we have not
  //     // teardown the job so that we the operations we provide can happen no worry
  //     if (this.crawlJobs[ jobIdx ].runs.length > 0) {
  //       if (!this.crawlJobs[ jobIdx ].runs[ 0 ].ended && job.runs[ 0 ].ended) {
  //         teardownJob(job.jobId)
  //       }
  //     }
  //     this.crawlJobs[ jobIdx ].runs = job.runs
  //     this.crawlJobs[ jobIdx ].log = job.log
  //     this.crawlJobs[ jobIdx ].launch = job.launch
  //     this.crawlJobs[ jobIdx ].logPath = job.logPath
  //     updated.push(job.jobId)
  //   })
  //   updated.forEach(updatedJob => {
  //     this.emit(`${updatedJob}-updated`)
  //   })
  // }

  getRuns (jobId) {
    let jobIdx = this.jobIndex.get(jobId)
    return this.crawlJobs[ jobIdx ].runs
  }

  @autobind
  latestJob () {
    return this.crawlJobs[ this.crawlJobs.length - 1 ]
  }

  @autobind
  jobs () {
    return this.crawlJobs
  }

  @autobind
  handleEvent (event) {
    // console.log('Got an event in crawl store', event)
    switch (event.type) {
      case EventTypes.BUILD_CRAWL_JOB: {
        // console.log('Build crawl job')
        var crawlingUrlsMessage
        var urls
        let depth = 1
        let showMessage = true
        let maybeArray = false
        switch (event.from) {
          case From.BASIC_ARCHIVE_NOW: {
            urls = UrlStore.getUrl()
            if (!urls.isEmpty()) {
              // console.log('crawlstore archiving the url is ', urls
              crawlingUrlsMessage = urls.s
              urls = urls.s
              GMessageDispatcher.dispatch({
                type: EventTypes.QUEUE_MESSAGE,
                message: 'Archiving Now!'
              })
            } else {
              showMessage = false
              GMessageDispatcher.dispatch({
                type: EventTypes.QUEUE_MESSAGE,
                message: 'You cannot archive an none existent URL!'
              })
            }
            break
          }
          case From.NEW_CRAWL_DIALOG: {
            maybeArray = Array.isArray(event.urls)
            depth = event.depth
            if (maybeArray) {
              crawlingUrlsMessage = `Urls: ${joinStrings(...event.urls, { separator: os.EOL })} With depth of ${depth}`
              urls = event.urls
            } else {
              if (S(event.urls).isEmpty()) {
                showMessage = false
              } else {
                crawlingUrlsMessage = `Urls: ${event.urls} With depth of ${depth}`
              }
            }
            break
          }
        }

        if (showMessage) {
          let jId = new Date().getTime()
          // MementoDispatcher.dispatch({
          //   type: EventTypes.BUILD_CRAWL_JOB,
          //   urls,
          //   maybeArray,
          //   jId
          // })
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: `Building Heritrix crawl for ${crawlingUrlsMessage}`
          })
          ipc.send('makeHeritrixJobConf', { urls, depth, jobId: jId, forCol: 'Wail' })
        }

        break
      }
      case EventTypes.BUILT_CRAWL_CONF: {
        // console.log('Built crawl conf', event)
        this.createJob(event.id, event.path, event.urls)
        buildHeritrixJob(event.id)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Built the Heritrix crawl config for job: ${event.id}`
        })
        break
      }
      case EventTypes.BUILT_CRAWL_JOB: {
        // console.log('Built crawl', event)
        // this.createJob(event.id, event.path)
        launchHeritrixJob(event.id)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Heritrix Crawl Built for job: ${event.id}`
        })
        break
      }
      case EventTypes.LAUNCHED_CRAWL_JOB: {
        // MementoDispatcher.dispatch({
        //   type: EventTypes.LAUNCHED_CRAWL_JOB,
        //   jId: event.id
        // })
        ipc.send('crawl-started',event.id)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Heritrix Crawl Started: ${event.id}`
        })
        break
      }
      case EventTypes.CRAWL_JOB_DELETED:
        this.crawlJobs = _.filter(this.crawlJobs, jb => jb.jobId !== event.jobId)
        this.jobIndex.delete(event.jobId)
        this.emit('jobs-updated')
        break
    }
  }
}

const CrawlStore = new CrawlStore_()

// noinspection JSAnnotator
window.CrawlStore = CrawlStore
CrawlDispatcher.register(CrawlStore.handleEvent)

export default CrawlStore
