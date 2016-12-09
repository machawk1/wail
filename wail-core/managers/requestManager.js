import autobind from 'autobind-decorator'
import rp from 'request-promise'
import _ from 'lodash'
import { ipcRenderer as ipc, remote } from 'electron'
import moment from 'moment'
import { default as wc } from '../constants'
import util from 'util'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default class RequestManager {
  constructor () {
    this.requestQ = []
    this.working = false
  }

  @autobind
  queueRequest (request) {
    console.log(`RequestDaemon got an incoming request[${request.id},${request.from}]`, request)
    // logger.info(util.format(logString, `got an incoming request[${request.id},${request.from}]`))
    if (Array.isArray(request.opts)) {
      request.opts.forEach(options => {
        let newR = _.cloneDeep(request)
        newR.opts = options
        this.requestQ.push(newR)
      })
    } else {
      this.requestQ.push(request)
    }
    if (!this.working) {
      console.log('RequestDaemon we are not working but we are now')
      this.working = true
      this.handleRequest()
    } else {
      console.log('RequestDaemon we are currently working and will continue to do so')
    }
  }

  @autobind
  maybeMore () {
    console.log('Do we have more requests to process?')
    if (this.requestQ.length > 0) {
      console.log('Yes we do handling them')
      // logger.info(util.format(logString, 'has more requests, handling them'))
      this.handleRequest()
    } else {
      console.log('No we do not. Waiting for more')
      // logger.info(util.format(logString, 'has not more requests waiting for more'))
      this.working = false
    }
  }

  @autobind
  handleRequest () {
    let request = this.requestQ.shift()
    console.log(`Handling a request[${request.id},${request.from}]`, request)
    // logger.info(util.format(logString, `handling a request[${request.id},${request.from}]`))
    let message = `handled request[${request.id},${request.from}]`
    rp(request.opts)
      .then(response => {
        console.log('The request got a response', response)
        // logger.info(util.format(logString, `request[${request.id},${request.from}] got a successful response`))
        request.response = response
        request.wasError = false
        ipc.send('handled-request', request)
        this.maybeMore()
      })
      .catch(error => {
        if (error.error.code === 'ETIMEDOUT' && !request.hadToRetry) {
          request.hadToRetry = true
          console.log('The request got an error of timeout retrying once')
          // logger.info(util.format(logString, `${message} and it resulted in an error of timeout retrying once`))
          this.requestQ.unshift(request)
        } else {
          if (error.error.code === 'ETIMEDOUT' && request.hadToRetry) {
            request.timeOutTwice = true
            // logger.info(util.format(logString, `the request[${request.id},${request.from}] timeout twice not retrying`))
          }
          console.log('The request got an error but its error callback will handle', error)
          // logger.info(util.format(logString, `${message} and it resulted in an error but its callback will handle ${error.message}`))
          request.response = error
          request.wasError = true
          ipc.send('handled-request', request)
        }
        this.maybeMore()
      })
  }
}
