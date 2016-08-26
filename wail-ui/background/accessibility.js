import 'babel-polyfill'
import autobind from 'autobind-decorator'
import { ipcRenderer, remote } from 'electron'
import rp from 'request-promise'
import schedule from 'node-schedule'
import Logger from '../logger/logger'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const settings = remote.getGlobal('settings')
const logger = new Logger({ path: remote.getGlobal('accessLogPath') })
const logString = 'accessibilityMonitor '

const cache = {
  accessibility: null
}

class StatusMonitor {
  constructor () {
    this.job = null
    this.started = false
    this.statues = {
      heritrix: false,
      wayback: false
    }
    this.lastFinished = true
  }

  /*
   error codes returned by request library:
   ECONNREFUSED: The connection was refused
   ETIMEDOUT:
   ETIMEDOUT: request timeout two cases
   - if connect === true, then the target of the request took its sweet time to reply
   - if connect === false, readtime out cause
   */

  @autobind
  checkReachability (cb) {
    if (!this.started) {
      let rule = new schedule.RecurrenceRule()
      rule.second = [ 0, 15, 30, 45 ]
      this.started = true
      this.job = schedule.scheduleJob(rule, () => {
        if (this.lastFinished) {
          this.lastFinished = false
          console.log('checking heritrix accessibility')
          rp(settings.get('heritrix.optionEngine'))
            .then(response => {
              this.statues.heritrix = true
            })
            .catch(err => {
              if (err.error.code === 'ECONNREFUSED') {
                this.statues.heritrix = false
                console.log('checking heritrix resulted in an error of connection refused', err.error.code, err.error.message)
              } else {
                console.log('checking heritrix resulted in an error other than connection refused', err.error.code, err.error.message)
              }
              console.log('heritrix error')
            })
            .finally(() => {
              console.log('checking wayback accessibility')
              rp({ uri: settings.get('pywb.url') })
                .then(success => {
                  this.statues.wayback = true
                })
                .catch(err => {
                  if (err.error.code === 'ECONNREFUSED') {
                    this.statues.wayback = false
                    console.log('checking wayback resulted in an error of connection refused', err.error.code, err.error.message)
                  } else {
                    console.log('checking wayback resulted in an error other than connection refused', err.error.code, err.error.message)
                  }
                })
                .finally(() => {
                  if (cache.accessibility) {
                    console.log('Accessibility cache is here ', cache)
                    let wasUpdate = false
                    if (this.statues.wayback !== cache.accessibility.get('wayback')) {
                      wasUpdate = true
                    }
                    if (this.statues.heritrix !== cache.accessibility.get('heritrix')) {
                      wasUpdate = true
                    }
                    if (wasUpdate) {
                      logger.info(`${logString} there was an update to service statuses: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                      cache.accessibility.set('wayback', this.statues.wayback)
                      cache.accessibility.set('heritrix', this.statues.heritrix)
                      console.log('there was an update to service statuses', cache, this.statues)
                      cb(this.statues)
                    } else {
                      console.log('no update to service statuses', cache, this.statues)
                      logger.info(`${logString} no update to service statuses: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                    }
                  } else {
                    console.log('Cache has not been created making it')
                    logger.info(`${logString} cache has not been created making it: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                    cache.accessibility = new Map()
                    cache.accessibility.set('wayback', this.statues.wayback)
                    cache.accessibility.set('heritrix', this.statues.heritrix)
                    cb(this.statues)
                  }
                  console.log('Done with status checks ', this.statues)
                  this.lastFinished = true
                })
            })
        }
      })
    }
  }
}

let Status = new StatusMonitor()

ipcRenderer.on('start-service-monitoring', (event) => {
  console.log('Monitor got start-service-monitoring')
  ipcRenderer.send('got-it', { from: 'accessibility', yes: true })
  Status.checkReachability((statues) => {
    ipcRenderer.send('service-status-update', statues)
  })
})

ipcRenderer.on('stop', (event) => {
  console.log('Monitor got stop indexing monitoring')
  logger.cleanUp()
  Status.job.cancel()
  Status.job = null
  Status = null
})
