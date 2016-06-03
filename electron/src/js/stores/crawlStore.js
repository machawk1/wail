import EventEmitter from 'eventemitter3'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'
import wailConstants from '../constants/wail-constants'
import * as heritrixActions from '../actions/heritrix-actions'
import UrlStore from '../stores/urlStore'
import _ from 'lodash'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

class crawlStore extends EventEmitter {
   constructor() {
      super()
      this.crawlJobs = []
      this.handleEvent = this.handleEvent.bind(this)
      this.createJob = this.createJob.bind(this)
      this.latestJob = this.latestJob.bind(this)
   }

   createJob(id, pth) {
      this.crawlJobs.push({
         jobId: id,
         path: pth,
         discovered: 0,
         queued: 0,
         downloaded: 0,
      })

      this.emit('job-created')
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
                  urls = UrlStore.getUrl() + '\nWith depth of 1'
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
            this.createJob(event.id, event.path)
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

      }


   }


}

const CrawlStore = new crawlStore;
CrawlDispatcher.register(CrawlStore.handleEvent)
export default CrawlStore;