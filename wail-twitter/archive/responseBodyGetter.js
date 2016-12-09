const EventEmitter = require('eventemitter3')
class ResponseBodyGetter extends EventEmitter {
  constructor () {
    super()
  }

  getBody (debug, forUrl) {
    debug.sendCommand('Network.getResponseBody', { requestId: forUrl.requestId }, (err, result) => {
      this.emit('got-body', { url: forUrl.url, err: err, result: result })
    })
  }
}

module.exports = ResponseBodyGetter
