const errorReport = (error, m) => ({
  wasError: true,
  err: error,
  message: {
    title: 'Error',
    level: 'error',
    autoDismiss: 0,
    message: m,
    uid: m
  }
})

const getOErrorMessage = (oError, defaultM) => {
  const theType = typeof oError
  if (theType === 'object') {
    if (Object.getOwnPropertyNames(oError).length == 0) {
      return defaultM
    }
    if (oError instanceof Error) {
      return oError.message
    }
    if (typeof oError.message === 'string') {
      return oError.message
    }
    if (typeof oError.reason === 'string') {
      return oError.reason
    }
    if (typeof oError.error === 'string') {
      return oError.error
    } else if (oError instanceof String) {
      return oError.valueOf()
    } else {
      return defaultM
    }
  } else if (theType === 'string') {
    if (oError === '') {
      return defaultM
    } else {
      return oError
    }
  } else if (theType === 'function') {
    const ret = oError()
    if (typeof ret === 'string') {
      return ret
    } else {
      return defaultM
    }
  } else {
    return defaultM
  }
}

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

