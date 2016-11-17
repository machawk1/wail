import wc from '../../constants/wail-constants'
const {RNS_SHOW_NOTIFICATION,RNS_HIDE_NOTIFICATION} = wc.EventTypes

export function notify (message) {
  return {
    type: RNS_SHOW_NOTIFICATION,
    ...message
  }
}

export function notifyInfo (message, log = false) {
  if (log) {
    window.logger.info(message)
  }
  return {
    type: RNS_SHOW_NOTIFICATION,
    title: 'Info',
    level: 'info',
    message,
    uid: message
  }
}

export function notifySuccess (message, log = false) {
  if (log) {
    window.logger.info(message)
  }
  return {
    type: RNS_SHOW_NOTIFICATION,
    title: 'Success',
    level: 'success',
    message,
    uid: message
  }
}

export function notifyWarning (message, log = false) {
  if (log) {
    window.logger.warn(message)
  }
  return {
    type: RNS_SHOW_NOTIFICATION,
    title: 'Warning',
    level: 'warning',
    message,
    uid: message
  }
}

export function notifyError (message, log = false) {
  if (log) {
    window.logger.error(message)
  }
  return {
    type: RNS_SHOW_NOTIFICATION,
    title: 'Error',
    level: 'error',
    message,
    uid: message
  }
}


export function hide(uid) {
  return {
    type: RNS_HIDE_NOTIFICATION,
    uid
  }
}
