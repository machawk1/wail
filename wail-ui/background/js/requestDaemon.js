import 'babel-polyfill'
import {ipcRenderer, remote} from 'electron'
import util from 'util'
import Logger from '../../logger/logger'
import HeritrixRequestMan from '../../../wail-core/managers/heritrix/heritrixRequestManager'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const logger = new Logger({ path: remote.getGlobal('requestDaemonLogPath') })
const logString = 'requestDaemon %s'
const logStringError = 'requestDaemon error where [ %s ] stack [ %s ]'

process.on('uncaughtException', (err) => {
  console.log(`uncaughtException: ${err}`, err, err.stack)
  logger.error('error', util.format(logStringError, `uncaughtException ${err.message}`, err.stack))
})

let requestDaemon = window.rd = new HeritrixRequestMan()

ipcRenderer.on('handle-request', (event, request) => {
  console.log('RequestDaemon got handle-request', request)
  logger.info(util.format(logString, `got handle-request ${request.from}`))
  // ipcRenderer.send('requestdaemon-ack')
  requestDaemon.queueRequest(request)
})

ipcRenderer.on('stop', (event) => {
  console.log('RequestDaemon got stop')
  logger.info(util.format(logString, 'got stop'))
  requestDaemon = null
  logger.cleanUp()
})
