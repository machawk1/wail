import getOErrorMessage from '../util/getOErrorMessage'

export class LoadError extends Error {
  constructor (oError) {
    super(`LoadError[${getOErrorMessage(oError, 'could not load db')}]`)
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

export class CountError extends Error {
  constructor (oError) {
    super(`CountError[${getOErrorMessage(oError, 'counting failed')}]`)
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

export class FindError extends Error {
  constructor (oError) {
    super(`FindError[${getOErrorMessage(oError, 'finding failed')}]`)
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

export class FindOneError extends Error {
  constructor (oError) {
    super(`FindOneError[${getOErrorMessage(oError, 'find one failed')}]`)
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

export class FindOneSelectError extends Error {
  constructor (oError) {
    super(`FindOneSelectError[${getOErrorMessage(oError, 'find one select failed')}]`)
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

export class InsertError extends Error {
  constructor (oError) {
    super(`InsertError[${getOErrorMessage(oError, 'insertion failed')}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
  }

  errorReport (message, title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: message,
        uid: message
      }
    }
  }
}

export class RemoveError extends Error {
  constructor (oError) {
    super(`RemoveError[${getOErrorMessage(oError, 'removing failed')}]`)
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

export class UpdateError extends Error {
  constructor (oError) {
    super(`DBUpdateError[${getOErrorMessage(oError, 'update failed')}]`)
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

export class FindAndUpdateOrInsertError extends Error {
  constructor (oError, where) {
    super(`FindAndUpdateOrCreateError[${getOErrorMessage(oError, `${where} failed`)}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
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

export class FindAndUpdateOrInsertThenFindAllError extends Error {
  constructor (oError, where) {
    super(`FindAndUpdateOrCreateThenFindAll[${getOErrorMessage(oError, `${where} failed`)}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
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

export class UpdateFindAllError extends Error {
  constructor (oError, where) {
    super(`UpdateFindAllError[${getOErrorMessage(oError, `${where} failed`)}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
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

export class InsertFindAllError extends Error {
  constructor (oError, where) {
    super(`InsertFindAllError[${getOErrorMessage(oError, `${where} failed`)}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
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

export class FatalDBError extends Error {
  constructor (oError, where, dbName) {
    super(`${dbName} FatalDBError [${getOErrorMessage(oError, where)}] ${where}`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.oError.m = this.errorReport()
    this.where = where
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

export class HardRemoveDbError extends Error {
  constructor (oError, dbName) {
    super(`${dbName} HardRemoveDbError [${getOErrorMessage(oError, `hard remove failed`)}]`)
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

export class DBErrorReport extends Error {
  constructor (oError, message) {
    super(message)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
  }

  get m () {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title: 'Error',
        level: 'error',
        autoDismiss: 0,
        message: message,
        uid: message
      }
    }
  }
}