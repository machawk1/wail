import EventEmitter from "eventemitter3"
import EditorDispatcher from "../dispatchers/editorDispatcher"
import wailConstants from "../constants/wail-constants"
import * as EditorActions from "../actions/editor-actions"

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From
const WhichCode = wailConstants.Code.which

class editorStore extends EventEmitter {
   constructor() {
      super()
      this.code = {
         wayBackConf: '',
         crawlerBean: '',
      }
      this.handleEvent = this.handleEvent.bind(this)
      this.getWayBackConf = this.getWayBackConf.bind(this)
      this.getCode = this.getCode.bind(this)
      if (process.env.NODE_ENV === 'development') {
         this.loadWaybackConf()
      }

   }

   loadWaybackConf() {
      this.code.wayBackConf = EditorActions.readCode(wailConstants.Code.wayBackConf)
      this.emit('code-fetched')
   }


   getCode(which) {
      switch (which) {
         case WhichCode.WBC:
            return this.code.wayBackConf
         case WhichCode.CRAWLBEAN:
            return this.code.crawlerBean
      }
   }

   getWayBackConf() {
      return this.code.wayBackConf
   }

   handleEvent(event) {
      console.log("Got an event in editor store", event)
      switch (event.type) {
         case EventTypes.FETCH_CODE:
            this.loadWaybackConf()
            break
      }

   }


}

const EditorStore = new editorStore;
EditorDispatcher.register(EditorStore.handleEvent)
export default EditorStore;