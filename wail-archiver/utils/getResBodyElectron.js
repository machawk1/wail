const Promise = require('bluebird')
const isEmpty = require('lodash/isEmpty')

function getResBodyElectron (requestId, wcDebugger) {
  return new Promise((resolve, reject) => {
    wcDebugger.sendCommand('Network.getResponseBody', {requestId}, (error, body) => {
      if (!isEmpty(error)) {
        reject(error)
      } else {
        resolve(body)
      }
    })
  })
}

module.exports = getResBodyElectron
