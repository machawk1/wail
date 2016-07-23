import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import util from 'util'
import {ipcRenderer, remote} from 'electron'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wailConstants from '../constants/wail-constants'
import {heritrixAccesible, launchHeritrix} from '../actions/heritrix-actions'
import {waybackAccesible, startWayback} from '../actions/wayback-actions'

const logger = remote.getGlobal('logger')

const EventTypes = wailConstants.EventTypes

const logString = 'service store %s'
// const serviceDialogeTemplate = '%s %s down'

function both () {
  console.log('Both')
  startWayback(() => {
    console.log('started wayback')
    launchHeritrix()
    console.log('started heritrix')
  })
}

const wayback = () => startWayback()
const heritrix = () => launchHeritrix()

class serviceStore extends EventEmitter {
  constructor () {
    super()
    this.serviceStatus = {
      heritrix: true,
      wayback: true,
    }

    this.statusDialog = {
      actions: [
        both,
        heritrix,
        wayback
      ],
      actionIndex: -1,
      message: '',
    }
    ipcRenderer.on('service-status-update', (event, update) => this.updateStatues(update))
  }

  @autobind
  updateStatues (update) {
    console.log('service updated')
    this.serviceStatus.heritrix = update.heritrix
    this.serviceStatus.wayback = update.wayback
    let logMessage = ''
    if (!update.heritrix && !update.wayback) {
      logMessage = 'heritrix and wayback are down asking to start'
      this.statusDialog.message = 'Heritrix and Wayback are not running. Restart services?'
      this.statusDialog.actionIndex = 0
    } else {
      let message = null
      if (!update.heritrix && update.wayback) {
        logMessage = 'heritrix was down but wayback was up asking to start'
        this.statusDialog.message = 'Heritrix is not running. Restart service?'
        this.statusDialog.actionIndex = 1
        message = 'Wayback is now running'
      } else if (update.heritrix && !update.wayback) {
        logMessage = 'wayback was down but heritrix was up asking to start'
        this.statusDialog.message = 'Wayback is not running. Restart service?'
        this.statusDialog.actionIndex = 2
        message = 'Hertrix is now running'
      } else {
        logMessage = 'heritrix and wayback are up'
        this.statusDialog.message = logMessage
        this.statusDialog.actionIndex = -1
        message = 'Hertrix and Wayback are now running'
      }
      if (message != null) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message
        })
      }
    }

    if (this.statusDialog.actionIndex !== -1) {
      this.emit('statusDialog')
    }

    logger.info(util.format(logString, logMessage))
    this.emit('monitor-status-update')
  }

  isUp (forWhich) {
    if (forWhich === 'heritrixAccesible') {
      return this.serviceStatus.heritrix
    } else {
      return this.serviceStatus.wayback
    }
  }

  @autobind
  statusActionMessage () {
    return this.statusDialog
  }

  checkStatues () {
    heritrixAccesible(true)
    waybackAccesible(true)
  }

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
        console.log('Heritrix status update serivice store', event, this.serviceStatus)
        this.serviceStatus.heritrix = event.status
        this.emit('heritrix-status-update')
        break
      case EventTypes.WAYBACK_STATUS_UPDATE:
        console.log('Wayback status update serivice store', event, this.serviceStatus)
        this.serviceStatus.wayback = event.status
        this.emit('wayback-status-update')
        break
    }
  }
}

const ServiceStore = new serviceStore()

ServiceDispatcher.register(ServiceStore.handleEvent)

export default ServiceStore
