import getOErrorMessage from '../../../util/getOErrorMessage'

export class ServicesPortTakenError extends Error {
  constructor (service, port) {
    super(`ServicesPortTaken[${service}] requires port ${port} but it was taken`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.service = service
    this.port = port
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class FailedToKillServiceTimeoutError extends Error {
  constructor (service, howKill) {
    super(`FailedToKillServiceTimeoutError[${service}]: failed to exit within 10 seconds after executing ${howKill}`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.service = service
    this.howKill = howKill
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class KillServiceError extends Error {
  constructor (service, howKill, oError) {
    super(`KillServiceError[${getOErrorMessage(oError, howKill)}]: ${howKill} threw an error while attempting to kill the ${service}`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.service = service
    this.howKill = howKill
    this.oError = oError
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class ServiceUnexpectedStartError extends Error {
  constructor (service, code) {
    super(`ServiceUnexpectedStartError[${service}]: unexpectedly exited during startup with code ${code}`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.service = service
    this.code = code
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class ServiceFatalProcessError extends Error {
  constructor (service, oError) {
    super(`ServiceFatalProcessError[${getOErrorMessage(oError, service)}]: ${service} unexpectedly threw an error and exited`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class BuildHeritrixClassPathError extends Error {
  constructor (oError) {
    super(`BuildHeritrixClassPathError[${getOErrorMessage(oError, 'failed to build classpath')}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}

export class CouldNotFindHeritrixMainClassError extends Error {
  constructor (oError) {
    super(`CouldNotFindHeritrixMainClassError[${getOErrorMessage(oError, 'failed find the heritrix main class')}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
  }

  errorReport (title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: this.message,
        uid: this.message
      }
    }
  }
}
