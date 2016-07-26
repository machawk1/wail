import 'babel-polyfill'
import EventEmitter from 'eventemitter3'
import { ipcRenderer, remote } from 'electron'
import _ from 'lodash'
import os from 'os'
import autobind from 'autobind-decorator'
import UrlStore from '../stores/urlStore'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import EditorDispatcher from '../dispatchers/editorDispatcher'
import wailConstants from '../constants/wail-constants'
import { readCode } from '../actions/editor-actions'
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

class crawlStore extends EventEmitter {
  constructor () {
    super()
    this.crawlJobs = []
    this.jobIndex = new Map()

    this.intialJobStateLoad()

    ipcRenderer.on('crawljob-status-update', (event, crawlStatus) => this.crawlJobUpdate(crawlStatus))
    ipcRenderer.on('crawljob-configure-dialogue', (event, newCrawl) => {
      makeHeritrixJobConf(newCrawl.urls, newCrawl.depth)
      let urls
      if (Array.isArray(newCrawl.urls)) {
        let temp = 'Urls: '
        event.urls.forEach(url => temp += `${url}${os.EOL}`)
        urls = temp + `With depth of ${newCrawl.depth}`
      } else {
        urls = `${newCrawl.urls} with depth of ${newCrawl.depth}`
      }
      GMessageDispatcher.dispatch({
        type: EventTypes.QUEUE_MESSAGE,
        message: `Building Heritrix crawl for ${urls}`
      })
    })
  }

  @autobind
  intialJobStateLoad () {
    console.log('initial load of crawl store')
    getHeritrixJobsState()
      .then(status => {
        console.log(status)
        if (status.count > 0) {
          EditorDispatcher.dispatch({
            type: EventTypes.STORE_HERITRIX_JOB_CONFS,
            confs: status.confs
          })
          this.jobIndex.clear()
          status.jobs.forEach((jrb, idx) => {
            this.jobIndex.set(jrb.jobId, idx)
          })
          console.log(status.jobs)
          this.crawlJobs = status.jobs
          this.emit('jobs-updated')
        }
      })
      .catch(error => {
        console.log('There was an error in getting the configs', error)
      })
  }

  @autobind
  createJob (id, pth, urls) {
    this.crawlJobs.push({
      jobId: id.toString(),
      path: pth,
      runs: [],
      urls: urls,
      crawlBean: readCode(`${settings.get('heritrixJob')}/${id.toString()}/crawler-beans.cxml`)
    })
    let idx = this.crawlJobs.length === 0 ? 0 : this.crawlJobs.length - 1
    this.jobIndex.set(id.toString(), idx)
    this.emit('jobs-updated')
  }

  @autobind
  crawlJobUpdate (jobs) {
    console.log('building jobs from job monitor', jobs.jobs)
    let updated = []
    jobs.jobs.forEach(job => {
      let jobIdx = this.jobIndex.get(job.jobId)
      // if the job has ended and our previous state says we have not
      // teardown the job so that we the operations we provide can happen no worry
      if (this.crawlJobs[ jobIdx ].runs.length > 0) {
        if (!this.crawlJobs[ jobIdx ].runs[ 0 ].ended && job.runs[ 0 ].ended) {
          teardownJob(job.jobId)
        }
      }
      this.crawlJobs[ jobIdx ].runs = job.runs
      this.crawlJobs[ jobIdx ].log = job.log
      this.crawlJobs[ jobIdx ].launch = job.launch
      this.crawlJobs[ jobIdx ].logPath = job.logPath
      updated.push(job.jobId)
    })
    updated.forEach(updatedJob => {
      this.emit(`${updatedJob}-updated`)
    })
  }

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
    console.log('Got an event in crawl store', event)

    switch (event.type) {
      case EventTypes.BUILD_CRAWL_JOB: {
        console.log('Build crawl job')
        let urls
        switch (event.from) {
          case From.BASIC_ARCHIVE_NOW: {
            urls = UrlStore.getUrl()
            console.log('crawlstore archiving the url is ', urls)
            makeHeritrixJobConf(urls, 1)
            break
          }
          case From.NEW_CRAWL_DIALOG: {
            makeHeritrixJobConf(event.urls, event.depth)
            if (Array.isArray(event.urls)) {
              let temp = 'Urls: '
              event.urls.forEach(url => {
                temp += `${url}${os.EOL}`
              })
              urls = temp + `With depth of ${event.depth}`
            }
            break
          }
        }
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Building Heritrix crawl for ${urls}`
        })
        break
      }
      case EventTypes.BUILT_CRAWL_CONF: {
        console.log('Built crawl conf', event)
        this.createJob(event.id, event.path, event.urls)
        buildHeritrixJob(event.id)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Built the Heritrix crawl config for job: ${event.id}`
        })
        break
      }
      case EventTypes.BUILT_CRAWL_JOB: {
        console.log('Built crawl', event)
        // this.createJob(event.id, event.path)
        launchHeritrixJob(event.id)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Heritrix Crawl Built for job: ${event.id}`
        })
        break
      }
      case EventTypes.LAUNCHED_CRAWL_JOB: {
        console.log('Launched crawl', event)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Heritrix Crawl Built launched job: ${event.id}`
        })
        break
      }
      case EventTypes.HERITRIX_CRAWL_ALL_STATUS: {
        this.crawlJobs = event.jobReport
        this.emit('jobs-updated')
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

const CrawlStore = new crawlStore()

// noinspection JSAnnotator
window.CrawlStore = CrawlStore
CrawlDispatcher.register(CrawlStore.handleEvent)

export default CrawlStore
