import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import fs from 'fs-extra'
import rp from 'request-promise'
import serializeError from 'serialize-error'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'
import findP from 'find-process'
import {
  findProcessOnHeritrixPort,
  findHPidWindows,
  findWbPidWindows,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport,
  killPid
} from '../util/serviceManHelpers'

Promise.promisifyAll(Datastore.prototype)
Promise.promisifyAll(fs)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)
const hFindRegx = /(heritrix)|(java)/i
const waybackUp = Symbol('waybackGood'), waybackDown = Symbol('waybackDown')
const heritrixUp = Symbol('heritrixGood'), heritrixDown = Symbol('heritrixDown')
const bothDown = Symbol('bothHeritrixAndWaybackDown'), bothUp = Symbol('bothHeritrixAndWaybackUp')
const hdWU = Symbol('hdWu'), huWd = Symbol('huWd')

const hWentDown = (oh, nh) => oh === heritrixUp && nh === heritrixDown
const wbWentDown = (ow, nw) => ow === waybackUp && nw === waybackDown

const whatHappened = (oh, nh, ow, nw) => {
  let wdown = wbWentDown(ow, nw), hdown = hWentDown(oh, nh)
  if (wdown && hdown) {
    return bothDown
  }
  if (!wdown && hdown) {
    return hdWU
  }

  if (wdown && !hdown) {
    return huWd
  }
  return bothUp
}

const exec = (args) => new Promise((resolve, reject) => {
  cp.exec(args, (err, stdout, stderr) => {
    if (err) {
      resolve({wasError: true, err, stderr, stdout})
    } else {
      resolve({wasError: false, stderr, stdout})
    }
  })
})

export default class ServiceManager {
  constructor (settings) {
    this._monitoring = new Map()
    this._accessCache = new Map()
    this._accessCache.set('firstTime', true)
    this._pidStore = new Datastore({
      filename: path.join(settings.get('wailCore.db'), 'pids.db'),
      autoload: true
    })
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  async _pingIsHeritrixDown () {
    try {
      await rp(this._settings.get('heritrix.optionEngine'))
    } catch (err) {
      if (err.error.code === 'ETIMEDOUT') {
        return false
      } else {
        return err.statusCode !== 303
      }
    }
    return false
  }

  async _pingIsWaybackDown () {
    try {
      await rp(this._settings.get('pywb.url'))
    } catch (err) {
      return true
    }
    return false
  }

  async _checkStatus () {
    let hStatus = heritrixUp, wStatus = waybackUp
    if (!this.isServiceUp('heritrix')) {
      let hTruelyDown = await this._pingIsHeritrixDown()
      if (hTruelyDown) {
        hStatus = heritrixDown
      }
    }
    if (!this.isServiceUp('wayback')) {
      let wTruelyDown = await this._pingIsWaybackDown()
      if (wTruelyDown) {
        wStatus = waybackDown
      }
    }

    if (!this._accessCache.get('firstTime')) {
      // console.log('Accessibility cache is here ', this._accessCache)
      let wasUpdate = false, oldWStatus = this._accessCache.get('wayback'), oldHStatus = this._accessCache.get('heritrix')
      if (wStatus !== oldWStatus) {
        wasUpdate = true
      }
      if (hStatus !== oldHStatus) {
        wasUpdate = true
      }
      if (wasUpdate) {
        this._accessCache.set('wayback', wStatus)
        this._accessCache.set('heritrix', hStatus)
        switch (whatHappened(oldHStatus, hStatus, oldWStatus, wStatus)) {
          case bothDown:
          case bothUp:
          case hdWU:
          case huWd:
          default:
            break
        }
        // console.log('there was an update to service statuses', this._accessCache, wStatus, hStatus)
      } else {
        // console.log('no update to service statuses', this._accessCache, wStatus, hStatus)
      }
    } else {
      this._accessCache.set('firstTime', false)
      this._accessCache.set('wayback', wStatus)
      this._accessCache.set('heritrix', hStatus)
    }
  }

  init () {
    return new Promise((resolve, reject) => {
      this._pidStore.find({}, (error, pids) => {
        if (error) {
          // console.error('there was an error in ServiceManage intit get persisted pids', error)
          resolve()
        } else {
          if (pids.length > 0) {
            // console.log('we have persisted pids')
            pids.forEach(pPid => {
              this._monitoring.set(pPid.who, pPid.pid)
            })
          } else {
            // console.log('we do not have persisted pids')
          }
        }
        resolve()
      })
    })
  }

  isServiceUp (which) {
    let pid = this._monitoring.get(which)
    if (pid) {
      // console.log(`checking serivce ${which}`, pid, isRunning(pid))
      return isRunning(pid)
    } else {
      // console.log(`checking serivce ${which} has not been started`)
      return false
    }
  }

  async restartWayback () {
    // console.log('restarting wayback')
    await this.killService('wayback')
    await this.startWayback()
  }

  async killAllServices () {
    let forgetMe = []
    for (let [who, pid] of this._monitoring) {
      if (this.isServiceUp(who)) {
        forgetMe.push(who)
        await killPid(pid)
      }
    }
    if (forgetMe.length > 0) {
      await this._removeFromPidStore({}, {multi: true})
      forgetMe.forEach(fm => {
        this._monitoring.delete(fm)
      })
    }
  }

  _removeFromPidStore (removeMe, opts = {}) {
    return new Promise((resolve, reject) => {
      this._pidStore.remove(removeMe, opts, (error) => {
        if (error) {
          // console.error(`ServiceManager error removing from pidstore ${removeMe.who || 'all'}`)
          reject(error)
        } else {
          // console.log(`ServiceManager removed ${removeMe.who || 'all'} from pidstore`)
          resolve()
        }
      })
    })
  }

  async killService (which) {
    if (which === 'all') {
      return await this.killAllServices()
    } else {
      if (this.isServiceUp(which)) {
        let pid = this._monitoring.get(which)
        await killPid(pid)
        this._monitoring.delete(which)
        return await this._removeFromPidStore({_id: which, who: which})
      }
    }
  }

  async startHeritrix () {
    let {logger} = global
    // console.log('service man starting heritrix')
    if (this.isServiceUp('heritrix')) {
      if (logger) {
        logger.info('starting heritrix but it was up already')
      }
      // console.log('heritrix is already up', this._monitoring)
    } else {
      // console.log('heritrix is not up starting')
      if (this._isWin) {
        let didStart = await this._startHeritrixWin()
        if (didStart.wasError) {
          throw didStart.errorReport.error
        }
      } else {
        let hStart = await exec(this._hStartCmdNotWin())
        if (hStart.wasError) {
          throw hStart.err
        }
        let {stderr, stdout} = hStart
        // console.log('heritrix was started')
        // console.log('stdout', stdout)
        // console.log('stderr', stderr)
        let out = S(stdout)
        let {wasError, errorType, errorMessage} = wasHeritrixStartError(out, stderr)
        if (wasError) {
          // console.error('heritrix could not be started due to an error', stderr, stdout)
          let theError = new Error(errorMessage)
          if (logger) {
            logger.fatal({err: theError, msg: `heritrix could not be started ${stdout} ${errorMessage}`})
          }
          throw theError
        } else {
          let pidLine = S(stdout).lines()[0]
          let maybepid = hpidGetter.exec(pidLine)
          if (maybepid) {
            let pid = S(maybepid.capture('hpid')).toInt()
            this._monitoring.set('heritrix', pid)
            // console.log('Heritrix was started')
            if (logger) {
              logger.info(`heritrix was started ${pid} ${stderr} ${stdout}`)
            }
            await this._updatePidStore(pid, 'heritrix')
          } else {
            if (logger) {
              logger.fatal('the pid extraction could not be done for heritrix')
            }
            // console.error('the pid extraction could not be done for heritrix')
            throw new Error('the pid extraction could not be done for heritrix')
          }
        }
      }
    }
  }

  async startHeritrixLoading () {
    let {logger} = global
    // console.log('service man starting heritrix loading')
    if (this.isServiceUp('heritrix')) {
      if (logger) {
        logger.info('starting heritrix but it was up already')
      }
      // console.log('heritrix is already up', this._monitoring)
      return {wasError: false}
    } else {
      // console.log('heritrix is not up starting')
      let didStart
      if (this._isWin) {
        didStart = await this._startHeritrixWin()
      } else {
        didStart = await this._startHeritrixNotWin(logger)
      }
      if (didStart.wasError) {
        if (didStart.errorType === 1) {
          return await this._maybeFindHeritrixProcess(didStart)
        } else {
          delete didStart.errorType
          return didStart
        }
      } else {
        return didStart
      }
    }
  }

  async startWayback () {
    // console.log('service man starting wayback')
    let {logger} = global
    if (this.isServiceUp('wayback')) {
      // console.log('wayback was already up')
      if (logger) {
        logger.info('starting wayback but was already up')
      }
    } else {
      if (process.platform === 'win32') {
        try {
          await this._startWaybackWin(logger)
        } catch (error) {
          throw result.errorReport.error
        }
      } else {
        // console.log('starting wayback')
        let exec = this._settings.get('pywb.wayback')
        let opts = {
          cwd: this._settings.get('pywb.home'),
          detached: true,
          shell: true,
          stdio: ['ignore', 'ignore', 'ignore']
        }
        let wayback = cp.spawn(exec, ['-d', this._settings.get('warcs')], opts)
        let pid = wayback.pid
        wayback.unref()
        // await Promise.delay(2000)
        // if (!isRunning(pid)) {
        //   throw new Error('Wayback was started but it stopped shortly after starting')
        // }
        this._monitoring.set('wayback', pid)
        console.log('wayback was started', this._monitoring, pid)
        await this._updatePidStore(pid, 'wayback')
      }
    }
  }

  async startWaybackLoading () {
    // console.log('service man starting wayback')
    let {logger} = global
    if (this.isServiceUp('wayback')) {
      // console.log('wayback was already up')
      if (logger) {
        logger.info('starting wayback but was already up')
      }
      return {wasError: false}
    } else {
      if (process.platform === 'win32') {
        return await this._startWaybackWin(logger)
      } else {
        // console.log('starting wayback')
        let exec = this._settings.get('pywb.wayback')
        let opts = {
          cwd: this._settings.get('pywb.home'),
          detached: true,
          shell: true,
          stdio: ['ignore', 'ignore', 'ignore']
        }
        let wayback
        try {
          wayback = cp.spawn(exec, ['-d', this._settings.get('warcs')], opts)
        } catch (err) {
          if (logger) {
            logger.fatal({err, msg: 'wayback could not be started'})
          }
          // console.error('wayback could not be started', err)
          return {
            wasError: true,
            errorReport: {
              error: err.message,
              where: 'Launching Wayack'
            }
          }
        }
        let pid = wayback.pid
        wayback.unref()
        await Promise.delay(3000)
        if (isRunning(pid)) {
          this._monitoring.set('wayback', pid)
          // console.log('wayback was started', pid)
          try {
            await this._updatePidStore(pid, 'wayback')
          } catch (insertError) {
            // console.error('service manager inserting pid for wayback error', insertError)
            if (logger) {
              logger.fatal({msg: 'service manager inserting pid for wayback error', err: insertError})
            }
            return {
              wasError: true,
              errorReport: {
                error: insertError.message,
                where: 'updating pid store'
              }
            }
          }
          return {wasError: false}
        } else {
          return {
            wasError: true,
            errorReport: {
              error: 'Wayback was started but it stopped shortly after starting',
              where: 'Launching Wayack'
            }
          }
        }
      }
    }
  }

  _updatePidStore (pid, who) {
    return new Promise((resolve, reject) => {
      this._pidStore.update({_id: who, who}, {$set: {pid}}, {upsert: true}, insertError => {
        if (insertError) {
          // console.error('service manager inserting pid error', insertError)
          reject(insertError)
        } else {
          resolve()
        }
      })
    })
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

  async _startWaybackWin (logger) {
    let exec = this._settings.get('pywb.wayback')
    let opts = {
      cwd: this._settings.get('pywb.home'),
      detached: true,
      shell: true,
      stdio: ['ignore', 'ignore', 'ignore']
    }
    try {
      let wayback = cp.spawn(exec, ['-d', this._settings.get('warcs')], opts)
      wayback.unref()
    } catch (err) {
      if (logger) {
        logger.fatal({err, msg: 'wayback could not be started'})
      }
      // console.error('wayback could not be started', err)
      return {
        wasError: true,
        errorReport: {
          error: err,
          where: 'Launching Wayack'
        }
      }
    }
    let result
    try {
      result = await findWbPidWindows()
    } catch (err) {
      return {
        wasError: true,
        errorReport: {
          error: err,
          where: 'finding wayback pid'
        }
      }
    }
    if (result.found) {
      // console.log('wayback pid was found')
      this._monitoring.set('wayback', result.pid)
      try {
        await this._updatePidStore(result.pid, 'wayback')
      } catch (error) {
        return {
          wasError: true,
          errorReport: {
            error: error,
            where: 'updating the pidStore'
          }
        }
      }
      if (logger) {
        logger.info(`wayback was started ${result.pid}`)
      }
      // console.log('resolving waybackpid')
      return {wasError: false}
    } else {
      return {
        wasError: true,
        errorReport: {
          error: new Error('Could not find wayback pid'),
          where: 'Starting Wayback'
        }
      }
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
      let result
      try {
        result = await findHPidWindows()
      } catch (errFind) {
        return {
          wasError: true,
          errorType: 2,
          errorReport: {
            error: 'Could not find heritrix pid',
            where: 'Starting Heritrix'
          }
        }
      }
      if (result.found) {
        this._monitoring.set('heritrix', result.pid)
        try {
          await this._updatePidStore(result.pid, 'heritrix')
        } catch (error) {
          return {
            wasError: true,
            errorReport: {
              error: error.message,
              where: 'updating the pidStore'
            }
          }
        }
        return {wasError: false}
      } else {
        return {
          wasError: true,
          errorType: 2,
          errorReport: {
            error: 'Could not find heritrix pid',
            where: 'Starting Heritrix'
          }
        }
      }
    } catch (startError) {
      // why you no work???
      return {
        wasError: true,
        errorType: 2,
        errorReport: {
          error: 'Spawning the heritrix process failed due to technical reasons',
          where: 'Starting Heritrix'
        }
      }
    }
  }

  async _startHeritrixNotWin (logger) {
    let hStart = await exec(this._hStartCmdNotWin())
    if (hStart.wasError) {
      let {err, stderr, stdout} = hStart
      // console.error('heritrix could not be started due to an error', err, stderr, stdout)
      if (logger) {
        logger.fatal({err, msg: `heritrix could not be started ${stderr}`})
      }
      return {
        wasError: true,
        errorType: 4,
        errorReport: {
          error: err.message,
          where: 'Launch Heritrix Technical Reason'
        }
      }
    } else {
      let {stderr, stdout} = hStart
      // console.log('heritrix was started')
      // console.log('stdout', stdout)
      // console.log('stderr', stderr)
      let out = S(stdout)
      let {wasError, errorType, errorMessage} = wasHeritrixStartError(out, stderr)
      if (wasError) {
        // console.error('heritrix could not be started due to an error', stderr, stdout)
        let theError = new Error(errorMessage)
        if (logger) {
          logger.fatal({err: theError, msg: `heritrix could not be started ${stdout} ${errorMessage}`})
        }
        return {
          wasError: true,
          errorType,
          errorReport: {
            error: errorMessage,
            where: 'Launching Heritrix'
          }
        }
      } else {
        let pidLine = S(stdout).lines()[0]
        let maybepid = hpidGetter.exec(pidLine)
        if (maybepid) {
          let pid = S(maybepid.capture('hpid')).toInt()
          await Promise.delay(2000)
          if (isRunning(pid)) {
            this._monitoring.set('heritrix', pid)
            // console.log('Heritrix was started')
            if (logger) {
              logger.info(`heritrix was started ${pid} ${stderr} ${stdout}`)
            }
            try {
              await this._updatePidStore(pid, 'heritrix')
            } catch (errUpdate) {
              return {
                wasError: true,
                errorType: 3,
                errorReport: {
                  error: errUpdate.message,
                  where: 'Updating the pidStore'
                }
              }
            }
            return {wasError: false}
          } else {
            return {
              wasError: true,
              errorType: 2,
              errorReport: {
                error: 'Heritrix failed to start due to technical reasons',
                where: 'Launching Heritrix'
              }
            }
          }
        } else {
          if (logger) {
            logger.fatal('the pid extraction could not be done for heritrix')
          }
          // console.error('the pid extraction could not be done for heritrix')
          return {
            wasError: true,
            errorType: 3,
            errorReport: {
              error: 'the pid extraction could not be done for heritrix',
              where: 'Extracting pid'
            }
          }
        }
      }
    }
  }

  async _maybeFindHeritrixProcess () {
    let {logger} = global
    let findpResults = await findP('name', hFindRegx)
    let hfinder = heritrixFinder(findpResults)
    if (hfinder.found) {
      let {pid, isWails} = hfinder
      // console.log(`there is a heritrix instance running pid=${pid}`)
      if (isWails) {
        // console.log('it is wails')
        try {
          await this._updatePidStore(pid, 'heritrix')
        } catch (error) {
          if (logger) {
            logger.fatal({err: error, msg: serializeError(error)})
          }
          return heritrixLaunchErrorReport(error.message, 'Internal')
        }
        this._monitoring.set('heritrix', pid)
        return {wasError: false}
      } else {
        // console.log('it is not wails')
        return heritrixLaunchErrorReport("Another Heritrix instance not under WAIL's control is in use", 'Launching Heritrix')
      }
    } else {
      let whoOnPort
      try {
        whoOnPort = await findProcessOnHeritrixPort()
      } catch (whoOnPortError) {
        let eMessage = 'Another process is using the port[8443] that Heritrix uses. But WAIL could not determine which one'
        let where = 'Launching Heritrix'
        return heritrixLaunchErrorReport(eMessage, where)
      }
      let {found, whoOnPort: {pid, pname}} = whoOnPort
      let eMessage, where = 'Launching Heritrix'
      if (found) {
        // console.log(pid, pname)
        eMessage = `Another process[name=${pname}, pid=${pid}] is using the port[8443] that Heritrix uses`
      } else {
        // console.log('couldnt find who is on port')
        eMessage = 'Another process is using the port[8443] that Heritrix uses. But WAIL could not determine which one'
      }
      return heritrixLaunchErrorReport(eMessage, where)
    }
  }
}
