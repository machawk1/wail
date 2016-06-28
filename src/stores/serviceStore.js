import EventEmitter from "eventemitter3"
import {ipcRenderer} from "electron"
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import wailConstants from "../constants/wail-constants"
import {heritrixAccesible,launchHeritrix} from "../actions/heritrix-actions"
import {waybackAccesible,startWayback} from "../actions/wayback-actions"

const EventTypes = wailConstants.EventTypes


class serviceStore extends EventEmitter {
   constructor() {
      super()
      this.serviceStatus = {
         heritrix: false,
         wayback: false,
      }
      this.waybackStatus = this.waybackStatus.bind(this)
      this.heritrixStatus = this.heritrixStatus.bind(this)
      this.checkStatues = this.checkStatues.bind(this)
      this.handleEvent = this.handleEvent.bind(this)
      this.updateStatues = this.updateStatues.bind(this)
      ipcRenderer.on("service-status-update", (event, update) => this.updateStatues(update))
   }


   updateStatues(update) {
      console.log("service updated")
      let actualUpdate = false
      if (this.serviceStatus.heritrix != update.heritrix) {
         this.serviceStatus.heritrix = update.heritrix
         actualUpdate = true
      }

      if (this.serviceStatus.wayback != update.wayback) {
         this.serviceStatus.wayback = update.wayback
         actualUpdate = true
      }


      if (actualUpdate) {
         if(!this.serviceStatus.heritrix){
            launchHeritrix()
         }
         if(!this.serviceStatus.wayback){
            startWayback()
         }
         this.emit('monitor-status-update')
      }
   }

   checkStatues() {
      heritrixAccesible()
      waybackAccesible()
   }


   serviceStatuses() {
      return this.serviceStatus
   }

   heritrixStatus() {
      return this.serviceStatus.heritrix
   }

   waybackStatus() {
      return this.serviceStatus.wayback
   }

   handleEvent(event) {
      switch (event.type) {
         case EventTypes.HERITRIX_STATUS_UPDATE:
         {
            console.log("Heritrix status update serivice store", event, this.serviceStatus)
            this.serviceStatus.heritrix = event.status
            this.emit('heritrix-status-update')
            break
         }
         case EventTypes.WAYBACK_STATUS_UPDATE:
         {
            console.log("Wayback status update serivice store", event, this.serviceStatus)
            this.serviceStatus.wayback = event.status
            this.emit('wayback-status-update')
            break
         }
      }
   }
}

const ServiceStore = new serviceStore;

ServiceDispatcher.register(ServiceStore.handleEvent)

export default ServiceStore
