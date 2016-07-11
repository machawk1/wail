import 'babel-polyfill'
import autobind from 'autobind-decorator'
import {ipcRenderer, remote} from 'electron'
import rp from 'request-promise'
import _ from 'lodash'
import util from 'util'
import Logger from '../logger/logger'

require('request-debug')(rp)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const logger = new Logger({ path: remote.getGlobal('requestDaemonLogPath') })
const logString = 'requestDaemon %s'
const logStringError = 'requestDaemon error where [ %s ] stack [ %s ]'

process.on('uncaughtException', (err) => {
  console.log(`uncaughtException: ${err}`, err, err.stack)
  logger.error('error', util.format(logStringError, `uncaughtException ${err.message}`, err.stack))
})

class RequestDaemon {
  constructor () {
    this.requestQ = []
    this.working = false
  }

  @autobind
  handleRequest (request) {
    console.log(`RequestDaemon got an incoming request[${request.id},${request.from}]`, request)
    logger.info(util.format(logString, `got an incoming request[${request.id},${request.from}]`))
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
      this.handleRequests()
    } else {
      console.log('RequestDaemon we are currently working and will continue to do so')
    }
  }

  @autobind
  maybeMore () {
    console.log('Do we have more requests to process?')
    if (this.requestQ.length > 0) {
      console.log('Yes we do handling them')
      this.handleRequests()
    } else {
      console.log('No we do not. Waiting for more')
      this.working = false
    }
  }

  @autobind
  handleRequests () {
    let request = this.requestQ.shift()
    console.log(`Handling a request[${request.id},${request.from}]`, request)
    let message = `handled request[${request.id},${request.from}]`
    rp(request.opts)
      .then(response => {
        console.log('The request got a response', response)
        logger.info(util.format(logString, `${message} and it got a response`))
        request.response = response
        request.wasError = false
        ipcRenderer.send('handled-request', request)
        this.maybeMore()
      })
      .catch(error => {
        console.log('The request got an error but its error callback will handle', error)
        logger.info(util.format(logString, `${message} and it resulted in an error but its callback will handle`))
        request.response = error
        request.wasError = true
        ipcRenderer.send('handled-request', request)
        this.maybeMore()
      })
  }
}

let requestDaemon = new RequestDaemon()

ipcRenderer.on('handle-request', (event, request) => {
  console.log('RequestDaemon got handle-request', request)
  logger.info(util.format(logString, `got handle-request ${request.from}`))
  ipcRenderer.send('requestdaemon-ack')
  requestDaemon.handleRequest(request)
})

ipcRenderer.on('stop', (event) => {
  console.log('RequestDaemon got stop')
  logger.info(util.format(logString, 'got stop'))
  requestDaemon = null
  logger.cleanUp()
})
