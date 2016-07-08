import 'babel-polyfill'
import EventEmitter from 'eventemitter3'
import { ipcRenderer, remote } from 'electron'
import _ from 'lodash'
import os from 'os'
import autobind from 'autobind-decorator'
import UrlStore from '../stores/urlStore'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'
import EditorDispatcher from '../dispatchers/editorDispatcher'
import wailConstants from '../constants/wail-constants'
import { readCode } from '../actions/editor-actions'
import {
  getHeritrixJobsState,
  makeHeritrixJobConf,
  buildHeritrixJob,
  launchHeritrixJob
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

    ipcRenderer.on('crawljob-status-update', (event, crawlStatus) => this.populateJobsFromPrevious(crawlStatus))
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
      new Notification('Building Heritrix Crawl', {
        body: `Building the Job! for\n${urls}`
      })
    })
  }

  @autobind
  intialJobStateLoad () {
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
          this.emit('jobs-restored')
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
    this.jobIndex.set(id.toString(), this.crawlJobs.length - 1)

    this.emit('jobs-updated')
  }

  @autobind
  populateJobsFromPrevious (jobs) {
    console.log('building previous jobs', jobs.jobs)
    this.crawlJobs = jobs.jobs

    EditorDispatcher.dispatch({
      type: EventTypes.STORE_HERITRIX_JOB_CONFS,
      confs: jobs.confs
    })
    this.emit('jobs-updated')

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
      case EventTypes.BUILD_CRAWL_JOB:
      {
        console.log('Build crawl job')
        let urls

        switch (event.from) {
          case From.BASIC_ARCHIVE_NOW:
          {
            urls = UrlStore.getUrl()
            console.log('crawlstore archiving the url is ', urls)
            makeHeritrixJobConf(urls, 1)
            break
          }
          case From.NEW_CRAWL_DIALOG:
          {
            makeHeritrixJobConf(event.urls, event.depth)
            if (Array.isArray(event.urls)) {
              let temp = 'Urls: '
              event.urls.forEach(url => temp += `${url}${os.EOL}`)
              urls = temp + `With depth of ${event.depth}`
            }
            break
          }
        }

        new Notification('Building Heritrix Crawl', {
          body: `Building the Job! for\n${urls}`
        })

        break
      }
      case EventTypes.BUILT_CRAWL_CONF:
      {
        console.log('Built crawl conf', event)
        this.createJob(event.id, event.path, event.urls)
        buildHeritrixJob(event.id)
        new Notification('Built the Heritrix Crawl Config', {
          body: `Job id: ${event.id}\nJob location${event.path}`
        })

        break
      }
      case EventTypes.BUILT_CRAWL_JOB:
      {
        console.log('Built crawl', event)
        // this.createJob(event.id, event.path)
        launchHeritrixJob(event.id)
        new Notification('Heritrix Crawl Job Built', {
          body: `Job id: ${event.id}`
        })
        break
      }
      case EventTypes.LAUNCHED_CRAWL_JOB:
      {
        console.log('Launched crawl', event)
        new Notification('Heritrix Crawl Job Launched', {
          body: `Job id: ${event.id}`
        })
        // this.createJob(event.id, event.path)
        break
      }
      case EventTypes.HERITRIX_CRAWL_ALL_STATUS:
      {
        this.crawlJobs = event.jobReport
        this.emit('jobs-updated')
        break
      }
      case EventTypes.CRAWL_JOB_DELETED:
        this.crawlJobs = _.filter(this.crawlJobs, jb => jb.jobId !== event.jobId)
        this.emit('jobs-updated')
        break
    }

  }

}

const CrawlStore = new crawlStore()

//noinspection JSAnnotator
window.CrawlStore = CrawlStore
CrawlDispatcher.register(CrawlStore.handleEvent)

export default CrawlStore
