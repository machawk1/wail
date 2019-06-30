import Promise from 'bluebird'
import isEmpty from 'lodash/isEmpty'
import ArchiverError from './archiverError'

function getResBodyElectron (requestId, wcDebugger) {
  return new Promise((resolve, reject) => {
    wcDebugger.sendCommand('Network.getResponseBody', {requestId}, (error, body) => {
      if (!isEmpty(error)) {
        reject(new ArchiverError(error))
      } else {
        resolve(body)
      }
    })
  })
}

module.exports = getResBodyElectron
