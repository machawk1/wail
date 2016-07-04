import EventEmitter from "eventemitter3"
import autobind from "autobind-decorator"
import { ipcRenderer } from "electron"
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import wailConstants from "../constants/wail-constants"
import { heritrixAccesible, launchHeritrix } from "../actions/heritrix-actions"
import { waybackAccesible, startWayback } from "../actions/wayback-actions"
import { remote } from 'electron'
import util from 'util'

const logger = remote.getGlobal('logger')

const EventTypes = wailConstants.EventTypes

const logString = "service store %s"

class serviceStore extends EventEmitter {
  constructor () {
    super()
    this.serviceStatus = {
      heritrix: false,
      wayback: false,
    }
    ipcRenderer.on("service-status-update", (event, update) => this.updateStatues(update))
  }

  @autobind
  updateStatues (update) {
    console.log("service updated")
//     logger.log('info', logString, "services updated")
    this.serviceStatus.heritrix = update.heritrix
    this.serviceStatus.wayback = update.wayback

    if (!this.serviceStatus.heritrix) {
      logger.info(util.format(logString, "heritrix was down attempting to restart"))
      launchHeritrix()
    }
    if (!this.serviceStatus.wayback) {
      logger.info(util.format(logString, "wayback was down attempting to restart"))
      startWayback()
    }
    this.emit('monitor-status-update')

  }

  @autobind
  checkStatues () {
    heritrixAccesible()
    waybackAccesible()
  }

  @autobind
  serviceStatuses () {
    return this.serviceStatus
  }

  @autobind
  heritrixStatus () {
    return this.serviceStatus.heritrix
  }

  @autobind
  waybackStatus () {
    return this.serviceStatus.wayback
  }

  @autobind
  handleEvent (event) {
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

const ServiceStore = new serviceStore()

ServiceDispatcher.register(ServiceStore.handleEvent)

export default ServiceStore
