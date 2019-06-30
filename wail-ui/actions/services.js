import { ServiceEvents } from '../constants/wail-constants'
import { ipcRenderer as ipc } from 'electron'
import S from 'string'
import { notifyInfo, notify, notifyError, notifySuccess } from './notification-actions'
import { notificationMessages as notifm } from '../constants/uiStrings'

const {HERITRIX_STATUS_UPDATE, WAYBACK_STATUS_UPDATE, WAYBACK_RESTART} = ServiceEvents

const swapper = S('')

export const stopHeritrix = () => {
  notifyInfo(notifm.stoppingHeritrix)
  ipc.send('kill-service', 'heritrix')
  return {
    type: HERITRIX_STATUS_UPDATE,
    status: false
  }
}

export const stopWayback = () => {
  notifyInfo(notifm.stoppingWayback)
  ipc.send('kill-service', 'wayback')
  return {
    type: WAYBACK_STATUS_UPDATE,
    status: false
  }
}

export const startHeritrix = () => {
  notifyInfo(notifm.startingHeritrix)
  ipc.send('start-service', 'heritrix')
  return {
    type: HERITRIX_STATUS_UPDATE,
    status: true
  }
}

export const startWayback = () => {
  notifyInfo(notifm.startingWayback)
  ipc.send('start-service', 'wayback')
  return {
    type: WAYBACK_STATUS_UPDATE,
    status: true
  }
}

export const restartedWayback = (e, update) => {
  let action = {
    type: WAYBACK_STATUS_UPDATE,
    status: true
  }
  if (update.wasError) {
    let message = notifm.errorRestartingWaybacl
    notify({
      title: 'Error',
      level: 'error',
      message,
      uid: message,
      autoDismiss: 0
    })
    window.logger.error({
      message: 'restarting wayback failed',
      err: update.err
    })
    action.status = false
  }
  return action
}

export const serviceStarted = (e, update) => {
  let action = {status: true}
  let service = swapper.setValue(update.who).capitalize().s
  if (update.who === 'wayback') {
    action.type = WAYBACK_STATUS_UPDATE
  } else {
    action.type = HERITRIX_STATUS_UPDATE
  }
  if (update.wasError) {
    notifyError(notifm.startingServiceEncounteredError(service, update.err), true)
    action.status = false
  } else {
    notifySuccess(notifm.startedService(service))
    window.logger.debug(`Started Service ${service}`)
  }
  return action
}

export const serviceKilled = (e, update) => {
  let action = {status: false}
  let service = swapper.setValue(update.who).capitalize().s
  if (update.who === 'wayback') {
    action.type = WAYBACK_STATUS_UPDATE
  } else {
    action.type = HERITRIX_STATUS_UPDATE
  }
  if (update.wasError) {
    notifyError(notifm.stoppingServiceEncounteredError(service, update.err), true)
  } else {
    window.logger.debug(`Stopped Service ${service}`)
  }
  return action
}
