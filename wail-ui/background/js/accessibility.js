import 'babel-polyfill'
import { ipcRenderer, remote } from 'electron'
import rp from 'request-promise'
import fs from 'fs-extra'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'
import cp from 'child_process'
import findP from 'find-process'
import Settings from '../../../wail-core/settings'
import {
  findProcessOnHeritrixPort,
  findHPidWindows,
  findWbPidWindows,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport,
  killPid
} from '../../../wail-core/util/serviceManHelpers'
import schedule from 'node-schedule'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)
const hFindRegx = /(heritrix)|(java)/i

Promise.promisifyAll(Datastore.prototype)
Promise.promisifyAll(fs)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const settingsDir = remote.getGlobal('settingsDir')

Settings.configure({
  settingsDir,
  settingsFileName: 'settings.json',
  prettify: true
})

const waybackUp = Symbol('waybackGood'), waybackDown = Symbol('waybackDown')
const heritrixUp = Symbol('heritrixGood'), heritrixDown = Symbol('heritrixDown')

const cache = {
  wayback: null,
  heritrix: null,
  firstTime: true
}

const checkStatus = async () => {
  let hStatus = heritrixUp, wStatus = waybackUp
  try {
    await rp(settings.get('heritrix.optionEngine'))
  } catch (err) {
    if (err.error.code === 'ECONNREFUSED') {
      hStatus = heritrixDown
      console.log('checking heritrix resulted in an error of connection refused', err.error.code, err.error.message)
    } else {
      console.log('checking heritrix resulted in an error other than connection refused', err.error.code, err.error.message)
    }
    console.log('heritrix error')
  }

  try {
    await rp({uri: settings.get('pywb.url')})
  } catch (err) {
    if (err.error.code === 'ECONNREFUSED') {
      wStatus = waybackDown
      console.log('checking wayback resulted in an error of connection refused', err.error.code, err.error.message)
    } else {
      console.log('checking wayback resulted in an error other than connection refused', err.error.code, err.error.message)
    }
  }

  if (!cache.firstTime) {
    console.log('Accessibility cache is here ', cache)
    let wasUpdate = false
    if (wStatus !== cache.wayback) {
      wasUpdate = true
    }
    if (hStatus !== cache.heritrix) {
      wasUpdate = true
    }
    if (wasUpdate) {
      cache.wayback = wStatus
      cache.heritrix = hStatus
      console.log('there was an update to service statuses', cache, wStatus, hStatus)
    } else {
      console.log('no update to service statuses', cache, wStatus, hStatus)
    }
  } else {
    console.log('Cache has not been created making it')
    cache.wayback = wStatus
    cache.heritrix = hStatus
  }
}

const dbPath = path.join(Settings.getSync('wailCore.db'), 'pids.db')

class ServiceManager {
  constructor () {
    this._monitoring = new Map()
    this._pidStore = new Datastore({
      filename: dbPath
    })
    this._isWin = process.platform === 'win32'
  }

  _loadDb () {
    return new Promise((resolve, reject) => {
      this._pidStore.loadDatabase((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async _loadDbFixIfBad () {
    let wasError = false
    try {
      await this._loadDb()
    } catch (error) {
      wasError = true
      await fs.removeAsync(dbPath)
    }
    if (wasError) {
      await this._loadDb()
    }
  }

  async init () {
    await this._loadDbFixIfBad()
    let pids = await this._pidStore.findAsync({})
    if (pids.length > 0) {
      console.log('we have persisted pids')
      pids.forEach(pPid => {
        this._monitoring.set(pPid.who, pPid.pid)
      })
    } else {
      console.log('we do not have persisted pids')
    }
  }

  isServiceUp (which) {
    let pid = this._monitoring.get(which)
    if (pid) {
      console.log(`checking serivce ${which}`, pid, isRunning(pid))
      return isRunning(pid)
    } else {
      console.log(`checking serivce ${which} has not been started`)
      return false
    }
  }

  async killAllServices () {
    let forgetMe = []
    for (let [who, pid] of this._monitoring) {
      if (isRunning(pid)) {
        forgetMe.push(who)
        await killPid(pid)
      }
    }
    this._monitoring.clear()
    if (forgetMe.length > 0) {
      await this._pidStore.removeAsync({}, {multi: true})
    }
  }

  async killService (which) {
    if (which === 'all') {
      await this.killAllServices()
    } else {
      if (this.isServiceUp(which)) {
        let pid = this._monitoring.get(which)
        await killPid(pid)
        this._monitoring.delete(which)
        await this._pidStore.removeAsync({_id: which, who: which})
      }
    }
  }

  async startHeritrix () {
    if (!this.isServiceUp('heritrix')) {
      if (this._isWin) {
        const didStartWind = await this.startHeritrix()
      }
    }
  }

  _hStartCmdNotWin () {
    if (process.platform === 'darwin') {
      return this._settings.get('heritrixStartDarwin')
    } else {
      return this._settings.get('heritrixStart')
    }
  }

  _hStartOptsWin () {
    let heritrixPath = this._settings.get('heritrix.path')
    return {
      cwd: heritrixPath,
      env: {
        JAVA_HOME: this._settings.get('jdk'),
        JRE_HOME: this._settings.get('jre'),
        HERITRIX_HOME: heritrixPath
      },
      detached: true,
      shell: true,
      stdio: ['ignore', 'ignore', 'ignore']
    }
  }

  async _startHeritrixWin () {
    let opts = this._hStartOptsWin()
    let usrpwrd = `${this._settings.get('heritrix.username')}:${this._settings.get('heritrix.password')}`
    let pid = -1
    let args = ['-a', `${usrpwrd}`, '--jobs-dir', `${this._settings.get('heritrix.jobsDir')}`]
    try {
      let heritrix = cp.spawn('bin\\heritrix.cmd', args, opts)
      heritrix.unref()
    } catch (startError) {
      // why you no work???
      return {
        wasError: true,
        errorType: 2,
        errorReport: {
          error: startError,
          where: 'Starting Heritrix'
        }
      }
    }

    const findResults = await findHPidWindows()
    if (findResults.found) {
      this._monitoring.set('heritrix', findResults.pid)
      try {
        await this._updatePidStore(findResults.pid, 'heritrix')
        return {wasError: false}
      } catch (error) {
        return {
          wasError: true,
          errorReport: {
            error,
            where: 'updating the pidStore'
          }
        }
      }
    } else {
      return {
        wasError: true,
        errorType: 2,
        errorReport: {
          error: new Error('Could not find heritrix pid'),
          where: 'Starting Heritrix'
        }
      }
    }
  }

  _updatePidStore (pid, who) {
    return new Promise((resolve, reject) => {
      this._pidStore.update({_id: who, who}, {$set: {pid}}, {upsert: true}, insertError => {
        if (insertError) {
          console.error('service manager inserting pid error', insertError)
          reject(insertError)
        } else {
          resolve()
        }
      })
    })
  }
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

  async checkStatus () {
    let hStatus = heritrixUp, wStatus = waybackUp
    try {
      await rp(settings.get('heritrix.optionEngine'))
    } catch (err) {
      if (err.error.code === 'ECONNREFUSED') {
        hStatus = heritrixDown
        console.log('checking heritrix resulted in an error of connection refused', err.error.code, err.error.message)
      } else {
        console.log('checking heritrix resulted in an error other than connection refused', err.error.code, err.error.message)
      }
      console.log('heritrix error')
    }

    try {
      await rp({uri: settings.get('pywb.url')})
    } catch (err) {
      if (err.error.code === 'ECONNREFUSED') {
        wStatus = waybackDown
        console.log('checking wayback resulted in an error of connection refused', err.error.code, err.error.message)
      } else {
        console.log('checking wayback resulted in an error other than connection refused', err.error.code, err.error.message)
      }
    }

    if (!cache.firstTime) {
      console.log('Accessibility cache is here ', cache)
      let wasUpdate = false
      if (wStatus !== cache.wayback) {
        wasUpdate = true
      }
      if (hStatus !== cache.heritrix) {
        wasUpdate = true
      }
      if (wasUpdate) {
        cache.wayback = wStatus
        cache.heritrix = hStatus
        console.log('there was an update to service statuses', cache, wStatus, hStatus)
      } else {
        console.log('no update to service statuses', cache, wStatus, hStatus)
      }
    } else {
      console.log('Cache has not been created making it')
      cache.wayback = wStatus
      cache.heritrix = hStatus
    }
  }

  /*
   error codes returned by request library:
   ECONNREFUSED: The connection was refused
   ETIMEDOUT:
   ETIMEDOUT: request timeout two cases
   - if connect === true, then the target of the request took its sweet time to reply
   - if connect === false, readtime out cause
   */

  checkReachability (cb) {
    if (!this.started) {
      let rule = new schedule.RecurrenceRule()
      rule.second = [0, 15, 30, 45]
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
              rp({uri: settings.get('pywb.url')})
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
  // ipcRenderer.send('got-it', { from: 'accessibility', yes: true })
  // Status.checkReachability((statues) => {
  //   ipcRenderer.send('service-status-update', statues)
  // })
})

ipcRenderer.on('stop', (event) => {
  console.log('Monitor got stop indexing monitoring')
})
