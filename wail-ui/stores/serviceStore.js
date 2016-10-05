import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import {ipcRenderer, remote} from 'electron'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import wailConstants from '../constants/wail-constants'
import * as notify from '../actions/notification-actions'
import S from 'string'

const EventTypes = wailConstants.EventTypes

const logString = 'service store %s'


// const serviceDialogeTemplate = '%s %s down'

class ServiceStore_ extends EventEmitter {
  constructor () {
    super()
    this.serviceStatus = {
      heritrix: true,
      wayback: true
    }

    ipcRenderer.on('service-started', (event, update) => this.updateStatues(update))
    ipcRenderer.on('service-killed', (event, update) => this.updateStatues(update, true))
    ipcRenderer.on( 'restarted-wayback',(e,update) => {
      if(update.wasError) {
        notify.notify({
          autoDismiss: 0,
          title: 'Error',
            level: 'error',
            message: 'There was error restarting Wayback',
            uid: 'There was error restarting Wayback',
        })
        window.logger.error({
          message: 'restarting wayback failed',
          err: update.err
        })
      } else {
        notify.notify({
          autoDismiss: 0,
          title: 'Success',
          level: 'success',
          message: 'Wayback was successfully restarted',
          uid: 'Wayback was successfully restarted',
        })
      }
    })
  }

  @autobind
  updateStatues (update, isKill = false) {
    // console.log('service updated')
    let service = S(update.who).capitalize().s
    let alive = false
    if (isKill) {
      if (update.wasError) {
        notify.notifyError(`Stopping Service ${service} encountered an error ${update.err}`, true)
        alive = true
      } else {
        notify.notifySuccess(`Stopped Service ${service}`)
        window.logger.debug(`Stopped Service ${service}`)
      }
    } else {
      if (update.wasError) {
        notify.notifyError(`Starting Service ${service} encountered an error ${update.err}`, true)
      } else {
        alive = true
        notify.notifySuccess(`Started Service ${service}`)
        window.logger.debug(`Started Service ${service}`)
      }
    }

    if (update.who === 'wayback') {
      this.serviceStatus.wayback = alive
    } else if (update.who === 'heritrix') {
      this.serviceStatus.heritrix = alive
    }

    this.emit('monitor-status-update')
  }

  isUp (forWhich) {
    if (forWhich === 'heritrixAccesible') {
      return this.serviceStatus.heritrix
    } else {
      return this.serviceStatus.wayback
    }
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
        // console.log('Heritrix status update serivice store', event, this.serviceStatus)
        this.serviceStatus.heritrix = event.status
        this.emit('heritrix-status-update')
        break
      case EventTypes.WAYBACK_STATUS_UPDATE:
        // console.log('Wayback status update serivice store', event, this.serviceStatus)
        this.serviceStatus.wayback = event.status
        this.emit('wayback-status-update')
        break
      case EventTypes.WAYBACK_RESTART:
        ipcRenderer.send('restart-wayback')
        this.serviceStatus.wayback = false
        this.emit('wayback-status-update')
        break
    }
  }
}

const ServiceStore = new ServiceStore_()

// noinspection JSAnnotator
window.ServiceStore = ServiceStore

ServiceDispatcher.register(ServiceStore.handleEvent)

export default ServiceStore
