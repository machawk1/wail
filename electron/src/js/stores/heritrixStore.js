import EventEmitter from 'eventemitter3'
import HeritrixDispatcher from '../dispatchers/heritrix-dispatcher'
import wailConstants from '../constants/wail-constants'
import * as heritrixActions from '../actions/heritrix-actions'


const EventTypes = wailConstants.EventTypes

export default class CrawlStore extends EventEmitter {
   constructor() {
      super()
      this.jobs = {}

   }

   createJob(id,pth){
      this.jobs[id] = {
         jobID: id,
         path: pth,
         discovered: 0,
         queued: 0,
         downloaded: 0,
      }
      this.emit('job-created')
   }

   handleEvent(event) {
      console.log("Got an event", event)
      switch (event.type) {
         case EventTypes.HAS_VAILD_URI:
         {
            if (this.urlMemento.url != event.url) {
               this.urlMemento.url = event.url
               this.emit('url-updated')
            }

            break
         }
         case EventTypes.GOT_MEMENTO_COUNT:
         {
            
            this.urlMemento.mementos = event.mementos
            this.emit('memento-count-updated')
            break
         }

      }

   }

   getUrl() {
      return this.urlMemento.url
   }

   getMementoCount() {
      return this.urlMemento.mementos
   }

}

const HeritrixStore = new CrawlStore;
HeritrixDispatcher.register(HeritrixStore.handleEvent)
export default HeritrixStore;