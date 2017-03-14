import cp from 'child_process'
import Promise from 'bluebird'
import S from 'string'
import { Observable } from 'rxjs'
import EventEmitter from 'eventemitter3'
import psTree from 'ps-tree'
import isRunning from 'is-running'
import processStates from './processStates'
import {
  findProcessOnPort,
  checkProcessExists
} from '../../../util/serviceManHelpers'
import * as pcErrors from '../errors'

export default class WaybackProcessController extends EventEmitter {
  constructor (settings) {
    super()
    this._opts = {
      cwd: settings.get('pywb.home'),
      detached: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    }
    this._wbExe = settings.get('pywb.wayback')
    this._colDir = settings.get('warcs')
    this._isListening = false
    this._isRestarting = false
    this._processEventsObservable = null
    this._processStartDelay = null
    this.lastError = null
    this.process = null
    this.pid = null
    this.prevProcessState = null
    this.existingCheckInterval = null
    this.processState = processStates.not_started
    this.waybackTest = this.waybackTest.bind(this)
    this.checkIfAlive = this.checkIfAlive.bind(this)
  }

  waybackTest (found) {
    return found.cmd.indexOf(this._wbExe) !== -1
  }

  async checkIfPortTaken () {
    let maybeOnPort
    try {
      maybeOnPort = await findProcessOnPort(8080)
    } catch (err) {
      return {portTaken: false}
    }
    if (maybeOnPort.found) {
      if (maybeOnPort.whoOnPort.pname === 'wayback') {
        let waybackProcesses = await checkProcessExists(this.waybackTest, 'name', 'wayback')
        if (waybackProcesses.found && waybackProcesses.wails) {
          return {wails: true, portTaken: true, pid: maybeOnPort.whoOnPort.pid}
        } else {
          return {wails: false, portTaken: true, pid: maybeOnPort.whoOnPort.pid}
        }
      } else {
        return {wails: false, portTaken: true, pid: maybeOnPort.whoOnPort.pid}
      }
    } else {
      return {portTaken: false}
    }
  }

  async launchWayback () {
    if (this._shouldStart()) {
      let check = await this.checkIfPortTaken()
      if (!check.portTaken) {
        let ret = await this._doLaunch()
        this.emit('wayback-started', {prev: this.prevProcessState, cur: this.processState})
        return ret
      } else {
        if (check.wails) {
          this.handleExistingProcessOurs(parseInt(check.pid))
          return this.processState
        } else {
          throw new pcErrors.ServicesPortTakenError('wayback', 8080)
        }
      }
    } else {
      return this.processState
    }
  }

  async restart () {
    this._isRestarting = true
    await this.killProcess()
    this._isRestarting = false
    this.removeAllListeners('wayback-restart-exit')
    await this.launchWayback()
  }

  async killProcess () {
    if (this.process && this.isProcessStarted()) {
      // the pid given to use by the childProcess is the PPID not PID
      // so gotta do it the long way
      if (this._isRestarting) {
        await this._doKillProcessRestarting()
      } else {
        await this._doKillProcess()
      }
      this.process = null
      this._isListening = false
      if (this.existingCheckInterval) {
        clearInterval(this.existingCheckInterval)
        this.existingCheckInterval = null
        this._stateTransition(processStates.not_started)
        this.emit('wayback-exited', {prev: this.prevProcessState, cur: this.processState, code: 999})
      }
    }
  }

  handleExistingProcessOurs (pid) {
    console.log('wayback is already alive', pid)
    this.prevProcessState = processStates.starting
    this.processState = processStates.started
    this.process = {pid}
    this.pid = pid
    this.existingCheckInterval = setInterval(this.checkIfAlive, 1000 * 120) // check every 2min
    this.emit('wayback-started', {prev: this.prevProcessState, cur: this.processState})
  }

  checkIfAlive () {
    console.log('checking if alive')
    if (!isRunning(this.process.pid)) {
      if (this.existingCheckInterval) {
        clearInterval(this.existingCheckInterval)
        this.existingCheckInterval = null
      }
      this._processExited(999)
    }
  }

  observe (subscriber) {
    if (!this._processEventsObservable) {
      this._processEventsObservable = Observable.fromEventPattern(
        (handler) => {
          // add
          this.on('wayback-started', handler)
          this.on('wayback-exited', handler)
          this.on('wayback-kill-process-failed', handler)
          this.on('wayback-process-fatal-error', handler)
        },
        (handler) => {
          // remove
          this.removeListener('wayback-started', handler)
          this.removeListener('wayback-exited', handler)
          this.removeListener('wayback-kill-process-failed', handler)
          this.removeListener('wayback-process-fatal-error', handler)
        }
      )
    }

    return this._processEventsObservable.subscribe(subscriber)
  }

  isProcessStarting () {
    return this.processState === processStates.starting
  }

  isProcessStarted () {
    return this.processState === processStates.started
  }

  _maybeClearExistingInterval () {
    if (this.existingCheckInterval) {
      clearInterval(this.existingCheckInterval)
      this.existingCheckInterval = null
    }
  }

  _doLaunch () {
    this._processStarting()
    const args = ['-d', this._colDir]
    return new Promise((resolve, reject) => {
      const swapper = S('')
      this.process = cp.spawn(this._wbExe, args, this._opts)

      this.process.on('error', (err) => {
        console.log('Failed to start child process.', err)
        if (this._isUnexpectedStartExit()) {
          // we have not handled this and we are starting
          reject(this._unexpectedStartProcessError(err))
        } else {
          this._hardProcessError(err)
        }
      })

      this.process.on('close', (code) => {
        if (this._isUnexpectedStartExit()) {
          // we have not handled this and we are starting
          reject(this._unexpectedStartExit(code))
        } else {
          this._processExited(code)
        }
      })

      // this.process.stdout.on('data', (data) => {
      //   console.log(`stdout: ${data}`)
      // })

      this.process.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        if (!this._isListening) {
          swapper.setValue(data)
          if (swapper.contains('Starting pywb Wayback Web Archive Replay on port 8080')) {
            this._startDelay(resolve)
          } else if (swapper.contains('Address already in use')) {
            reject(this._startErrorPortUsed())
          }
        }
      })
    })
  }

  _startDelay (resolve) {
    this._processStartDelay = setTimeout(() => {
      clearTimeout(this._processStartDelay)
      this._processStartDelay = null
      resolve(this._engineListening())
    }, 3000)
  }

  _stateTransition (nextState) {
    this.prevProcessState = this.processState
    this.processState = nextState
  }

  _shouldStart () {
    return !(this.isProcessStarted() || this.isProcessStarting())
  }

  _processStarting () {
    if (this.lastError) {
      this.lastError = null
    }
    this._stateTransition(processStates.starting)
  }

  _isUnexpectedStartExit () {
    if (!this._isListening) {
      return this.processState === processStates.starting
    }
    return false
  }

  _unexpectedStartExit (code) {
    this._maybeClearExistingInterval()
    this._stateTransition(processStates.start_error_unexpected)
    return new pcErrors.ServiceUnexpectedStartError('wayback', code)
  }

  _unexpectedStartProcessError (err) {
    this._maybeClearExistingInterval()
    this._stateTransition(processStates.start_error_unexpected)
    return new pcErrors.ServiceFatalProcessError('wayback', err)
  }

  _killProcessFailed () {
    this._stateTransition(processStates.could_not_kill)
    this.emit('wayback-kill-process-failed', {prev: this.prevProcessState, cur: this.processState})
  }

  _hardProcessError (err) {
    this._maybeClearExistingInterval()
    this.lastError = err
    this._stateTransition(processStates.process_error)
    this.emit('wayback-process-fatal-error', {prev: this.prevProcessState, cur: this.processState})
  }

  _processExited (code) {
    if (this._shouldEmitExit()) {
      this._stateTransition(processStates.not_started)
      console.log('we should emit exit', code)
      this.emit('wayback-exited', {prev: this.prevProcessState, cur: this.processState, code})
    } else if (this._isRestarting) {
      this._stateTransition(processStates.not_started)
      this.emit('wayback-restart-exit', code)
    }
  }

  _startErrorPortUsed () {
    this._maybeClearExistingInterval()
    this.lastError = new pcErrors.ServicesPortTakenError('wayback', 8080)
    this._stateTransition(processStates.start_error_port_used)
    return this.lastError
  }

  _shouldEmitExit () {
    return !(
      this._isRestarting ||
      this.processState === processStates.start_error_port_used ||
      this.processState === processStates.start_error_unexpected
    )
  }

  _engineListening () {
    this.pid = this.process.pid
    this.process.unref()
    this._isListening = true
    this._stateTransition(processStates.started)
    // kill piped stdout/stderr read streams we know we have started correctly
    // wayback logs every action to these streams, keep our event loop for us only
    this.process.stdout.destroy()
    this.process.stderr.destroy()
    return this.processState
  }

  _processStarted () {
    this.processState = processStates.started
  }

  _doKillProcess () {
    return new Promise((resolve, reject) => {
      if (process.platform !== 'win32') {
        psTree(this.process.pid, (err, kids) => {
          if (err) {
            console.error('ps tree error', err)
            reject(new pcErrors.KillServiceError('waybak', 'psTree', err))
          } else {
            if (kids.length > 0) {
              let dukeNukem = cp.spawn('kill', ['-9'].concat(kids.map(p => p.PID)), {
                shell: true,
                stdio: ['ignore', 'ignore', 'ignore']
              })
              dukeNukem.on('exit', () => {
                resolve()
              })
            } else {
              process.kill(this.process.pid, 'SIGTERM')
              resolve()
            }
          }
        })
      } else {
        cp.exec(`taskkill /PID ${this.process.pid} /T /F`, (error, stdout, stderr) => {
          if (error) {
            reject(new pcErrors.KillServiceError('waybak', 'taskkill', error))
          } else {
            resolve()
          }
        })
      }
    })
  }

  _doKillProcessRestarting () {
    return new Promise((resolve, reject) => {
      if (process.platform !== 'win32') {
        psTree(this.process.pid, (err, kids) => {
          if (err) {
            console.error('ps tree error', err)
            reject(new pcErrors.KillServiceError('waybak', 'psTree', err))
          } else {
            if (kids.length > 0) {
              let dukeNukem = cp.spawn('kill', ['-9'].concat(kids.map(p => p.PID)), {
                shell: true,
                stdio: ['ignore', 'ignore', 'ignore']
              })
              dukeNukem.unref()
              let bail = setTimeout(() => {
                reject(new pcErrors.FailedToKillServiceTimeoutError('waybak', 'kill -9 pid'))
              }, 10000)
              this.on('wayback-restart-exit', (code) => {
                clearTimeout(bail)
                console.log('we have the restart exit', code)
                resolve()
              })
            } else {
              process.kill(this.process.pid, 'SIGTERM')
              let bail = setTimeout(() => {
                reject(new pcErrors.FailedToKillServiceTimeoutError('waybak', 'process.kill(pid,SIGTERM)'))
              }, 10000)
              this.on('wayback-restart-exit', (code) => {
                console.log('we have the restart exit', code)
                clearTimeout(bail)
                resolve()
              })
            }
          }
        })
      } else {
        cp.exec(`taskkill /PID ${this.process.pid} /T /F`, (error, stdout, stderr) => {
          if (error) {
            reject(new pcErrors.KillServiceError('waybak', 'taskkill', error))
          } else {
            let bail = setTimeout(() => {
              reject(new pcErrors.FailedToKillServiceTimeoutError('waybak', 'taskkill'))
            }, 10000)
            this.on('wayback-restart-exit', (code) => {
              console.log('we have the restart exit', code)
              clearTimeout(bail)
              resolve()
            })
          }
        })
      }
    })
  }
}
