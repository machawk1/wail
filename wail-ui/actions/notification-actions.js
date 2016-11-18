import wc from '../constants/wail-constants'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'

const EventTypes = wc.EventTypes

export function notify (message) {
  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message
  })
}

export function notifyInfo (message, log = false) {
  if (log) {
    window.logger.info(message)
  }
  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Info',
      level: 'info',
      message,
      uid: message
    }
  })
}

export function notifySuccess (message, log = false) {
  if (log) {
    window.logger.info(message)
  }
  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Success',
      level: 'success',
      message,
      uid: message
    }
  })
}

export function notifyWarning (message, log = false) {
  if (log) {
    window.logger.warn(message)
  }
  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Warning',
      level: 'warning',
      message,
      uid: message
    }
  })
}

export function notifyError (message, log = true) {
  if (log) {
    window.logger.error(message)
  }
  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Error',
      level: 'error',
      message,
      uid: message
    }
  })
}
