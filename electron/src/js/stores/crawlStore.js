import EventEmitter from 'eventemitter3'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'
import wailConstants from '../constants/wail-constants'
import{makeHeritrixJobConf} from '../actions/heritrix-actions'
import UrlStore from '../stores/urlStore'

const EventTypes = wailConstants.EventTypes

class crawlStore extends EventEmitter {
   constructor() {
      super()
      this.crawlJobs = [{
         jobId: 666,
         path: "Thunder Struct",
         discovered: 0,
         queued: 0,
         downloaded: 0,
      },
         {
            jobId: 1,
            path: "Make it so number 1",
            discovered: 0,
            queued: 0,
            downloaded: 0,
         },]
      this.handleEvent = this.handleEvent.bind(this)
      this.createJob = this.createJob.bind(this)
      this.latestJob = this.latestJob.bind(this)
   }

   createJob(id,pth){
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
      console.log("Got an event in crawl store", event)

      switch (event.type) {
         case EventTypes.BUILD_CRAWL_JOB:
         {
            makeHeritrixJobConf(UrlStore.getUrl(), 1)
            break
         }
         case EventTypes.BUILT_CRAWL_JOB:
         {
            console.log('Got Memento count in store', event)
            this.createJob(event.id, event.path)
            this.emit('memento-count-updated')
            break
         }

      }


   }


}

const CrawlStore = new crawlStore;
CrawlDispatcher.register(CrawlStore.handleEvent)
export default CrawlStore;