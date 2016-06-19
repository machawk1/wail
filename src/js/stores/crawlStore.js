import EventEmitter from "eventemitter3"
import CrawlDispatcher from "../dispatchers/crawl-dispatcher"

import wailConstants from "../constants/wail-constants"
import * as heritrixActions from "../actions/heritrix-actions"
import UrlStore from "../stores/urlStore"
import _ from 'lodash'
import { readCode } from '../actions/editor-actions'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

class crawlStore extends EventEmitter {
   constructor() {
      super()
      this.crawlJobs = []
      this.handleEvent = this.handleEvent.bind(this)
      this.createJob = this.createJob.bind(this)
      this.latestJob = this.latestJob.bind(this)
      this.jobs = this.jobs.bind(this)
      this.populateJobsFromPrevious = this.populateJobsFromPrevious.bind(this)
      heritrixActions.getHeritrixJobsState()
   }

   createJob(id, pth, urls) {
      this.crawlJobs.push({
         jobId: id.toString(),
         path: pth,
         runs: [],
         urls: urls,
         crawlBean: readCode( `${wailConstants.Paths.heritrixJob}/${id.toString()}/crawler-beans.cxml`)
      })

      this.emit('job-created')
   }

   populateJobsFromPrevious(jobs) {
      console.log('building previous jobs')
      
      _.forOwn(jobs, jb => {
         let job = {
            jobId: jb.jobId,
            path: `${wailConstants.Paths.heritrixJob}/${jb.jobId}`,
            urls: '',
            runs: [],
            crawlBean: jb.crawlBean
         }
         if (jb.log) {
            jb.progress.forEach(run => {
               job.runs.push({
                  discovered: run.discovered,
                  downloaded: run.downloaded,
                  ended: run.ended,
                  endedOn: run.endedOn,
                  queued: run.queued,
                  timestap: run.timestamp,
               })
            })

         }
         // console.log('adding job',job)
         this.crawlJobs.push(job)
      })


      this.emit('jobs-restored')
   }

   latestJob() {
      return this.crawlJobs[this.crawlJobs.length - 1]
   }

   jobs() {
      return this.crawlJobs
   }

   handleEvent(event) {
      console.log("Got an event in crawl store", event, heritrixActions)

      switch (event.type) {
         case EventTypes.BUILD_CRAWL_JOB:
         {
            console.log('Build crawl job')
            let urls = ''

            switch (event.from) {
               case From.BASIC_ARCHIVE_NOW:
               {
                  urls = UrlStore.getUrl()
                  heritrixActions.makeHeritrixJobConf(urls, 1)
                  break
               }
               case From.NEW_CRAWL_DIALOG:
               {
                  heritrixActions.makeHeritrixJobConf(event.urls, event.depth)
                  if (Array.isArray(event.urls)) {
                     let temp = 'Urls: '
                     event.urls.forEach(url => temp += `${url}\n`)
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
            heritrixActions.buildHeritrixJob(event.id)
            new Notification('Built the Heritrix Crawl Config', {
               body: `Job id: ${event.id}\nJob location${event.path}`
            })

            break
         }
         case EventTypes.BUILT_CRAWL_JOB:
         {
            console.log('Built crawl', event)
            // this.createJob(event.id, event.path)
            heritrixActions.launchHeritrixJob(event.id)
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
            this.populateJobsFromPrevious(event.jobReport)
         }

      }


   }


}

const CrawlStore = new crawlStore

window.CrawlStore = CrawlStore
CrawlDispatcher.register(CrawlStore.handleEvent)
export default CrawlStore;