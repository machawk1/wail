import { ipcRenderer, remote } from "electron"
import rp from 'request-promise'
import Promise from 'bluebird'
import settings from '../settings/settings'
import schedule from 'node-schedule'
import util from 'util'
import logger from 'electron-log'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"



logger.transports.file.format = '[{m}:{d}:{y} {h}:{i}:{s}] [{level}] {text}'
logger.transports.file.maxSize = 5 * 1024 * 1024
logger.transports.file.file = remote.getGlobal('accessLogPath')
logger.transports.file.streamConfig = {flags: 'a'}

const logString = "accessibilityMonitor "

const cache = {
  accessibility: null
}

function heritrixAccesible () {
  console.log("checking heritrix accessibility")
  let optionEngine = settings.get('heritrix.optionEngine')
  return new Promise((resolve, reject)=> {
    rp(optionEngine)
      .then(success => {
        resolve({ status: true })
      })
      .catch(err => {
        resolve({ status: false, error: err })
      })
  })
}

function waybackAccesible () {
  console.log("checking wayback accessibility")
  let wburi = settings.get('wayback.uri_wayback')
  return new Promise((resolve, reject)=> {
    rp({ uri: wburi })
      .then(success => {
        resolve({ status: true })
      })
      .catch(err => {
        resolve({ status: false, error: err })
      })
  })
}

class StatusMonitor {
  constructor () {
    this.job = null
    this.started = false
    this.statues = {
      heritrix: false,
      wayback: false
    }
    this.checkReachability = this.checkReachability.bind(this)
  }

  checkReachability (cb) {
    if (!this.started) {
      let rule = new schedule.RecurrenceRule()
      rule.second = [ 0, 10, 20, 30, 40, 50 ]
      this.job = schedule.scheduleJob(rule, () => {
        heritrixAccesible()
          .then(ha => this.statues.heritrix = ha.status)
          .catch(hdown => this.statues.heritrix = hdown.status)
          .finally(() =>
            waybackAccesible()
              .then(wba => this.statues.wayback = wba.status)
              .catch(wbdown => this.statues.wayback = wbdown.status)
              .finally(() => {
                if (cache.accessibility) {
                  console.log("Accessibility cache is here ", cache)

                  let wasUpdate = false
                  if (this.statues.wayback != cache.accessibility.get('wayback')) {
                    wasUpdate = true
                  }

                  if (this.statues.heritrix != cache.accessibility.get('heritrix')) {
                    wasUpdate = true
                  }

                  if (wasUpdate) {
                    logger.info(`${logString} there was an update to service statuses: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                    cache.accessibility.set('wayback', this.statues.wayback)
                    cache.accessibility.set('heritrix', this.statues.heritrix)
                    console.log('there was an update to service statuses', cache, this.statues)
                    cb(this.statues)
                  } else {
                    console.log("no update to service statuses", cache, this.statues)
                    logger.info( `${logString} no update to service statuses: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                  }

                } else {
                  console.log("Cache has not been created making it")
                  logger.info(`${logString} cache has not been created making it: heritrix[${this.statues.heritrix}] wayback[${this.statues.wayback}]`)
                  cache.accessibility = new Map()
                  cache.accessibility.set('wayback', this.statues.wayback)
                  cache.accessibility.set('heritrix', this.statues.heritrix)
                  cb(this.statues)
                }

                console.log("Done with status checks ", this.statues)
              })
          )
      })
      this.started = true
    }
  }
}

let Status = new StatusMonitor()

ipcRenderer.on("start-service-monitoring", (event) => {
    console.log('Monitor got start-service-monitoring')
  ipcRenderer.send('got-it',{ from: 'accessibility' ,yes: true})
    Status.checkReachability((statues) => {
      ipcRenderer.send("service-status-update", statues)
    })
  }
)

ipcRenderer.on("stop", (event) => {
  console.log('Monitor get start indexing monitoring')
  Status.job.cancel()
  Status.job = null
  Status = null
})
