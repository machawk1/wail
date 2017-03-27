export default function getOErrorMessage (oError, defaultM) {
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
