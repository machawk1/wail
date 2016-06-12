import EventEmitter from "eventemitter3";
import UrlDispatcher from "../dispatchers/url-dispatcher";
import wailConstants from "../constants/wail-constants";
import * as urlActions from "../actions/archive-url-actions";


const EventTypes = wailConstants.EventTypes

class urlStore extends EventEmitter {
   constructor() {
      super()
      this.urlMemento = {url: '', mementos: 0}
      this.handleEvent = this.handleEvent.bind(this)
      this.getUrl = this.getUrl.bind(this)
      this.getMementoCount = this.getMementoCount.bind(this)
   }

   handleEvent(event) {
      console.log("Got an event url store", event)
      switch (event.type) {
         case EventTypes.HAS_VAILD_URI:
         {
            if (this.urlMemento.url != event.url) {
               this.urlMemento.url = event.url
               console.log("url updated ")
               this.emit('url-updated')
            }

            break
         }
         case EventTypes.GOT_MEMENTO_COUNT:
         {
            console.log('Got Memento count in store', event)
            this.urlMemento.mementos = event.mementos
            this.emit('memento-count-updated')
            break
         }
         case EventTypes.GET_MEMENTO_COUNT:{
            urlActions.askMemgator(this.urlMemento.url)
            this.emit('memento-count-fetch')
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

const UrlStore = new urlStore;
UrlDispatcher.register(UrlStore.handleEvent)
export default UrlStore;