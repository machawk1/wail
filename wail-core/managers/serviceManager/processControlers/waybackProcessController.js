import cp from 'child_process'
import Path from 'path'
import * as fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import { Observable } from 'rxjs'
import EventEmitter from 'eventemitter3'
import psTree from 'ps-tree'
import processStates from './processStates'

export default class WaybackProcessController extends EventEmitter {
  constructor (wbExe, colDir, opts) {
    super()
    this._opts = opts
    this._wbExe = wbExe
    this._colDir = colDir
    this._isListening = false
    this.lastError = null
    this.process = null
    this.pid = null
    this.prevProcessState = null
    this.processState = processStates.not_started
    this._processEventsObservable = null
    this._processStartDelay = null
  }

  async launchWayback () {
    if (this._shouldStart()) {
      let ret = await this._doLaunch()
      this.emit('wayback-started', {prev: this.prevProcessState, cur: this.processState})
      return ret
    } else {
      return this.processState
    }
  }

  async killProcess () {
    if (this.process && this.isProcessStarted()) {
      // the pid given to use by the childProcess is the PPID not PID
      // so gotta do it the long way
      try {
        await this._doKillProcess()
      } catch (err) {
        this.lastError = err
        this._killProcessFailed()
      }
      this.process = null
      this._isListening = false
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
          this._hardProcessError()
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
    if (this._processStartDelay) {
      clearTimeout(this._processStartDelay)
    }
    this._stateTransition(processStates.start_error_unexpected)
    return new Error(`Wayback Unexpectedly exited during start up with code: ${code}`)
  }

  _unexpectedStartProcessError (err) {
    if (this._processStartDelay) {
      clearTimeout(this._processStartDelay)
    }
    this._stateTransition(processStates.start_error_unexpected)
    return err
  }

  _killProcessFailed () {
    this._stateTransition(processStates.could_not_kill)
    this.emit('wayback-kill-process-failed', {prev: this.prevProcessState, cur: this.processState})
  }

  _hardProcessError () {
    this._stateTransition(processStates.process_error)
    this.emit('wayback-process-fatal-error', {prev: this.prevProcessState, cur: this.processState})
  }

  _processExited (code) {
    if (this._shouldEmitExit()) {
      this._stateTransition(processStates.not_started)
      this.emit('wayback-exited', {prev: this.prevProcessState, cur: this.processState, code})
    }
  }

  _startErrorPortUsed () {
    if (this._processStartDelay) {
      clearTimeout(this._processStartDelay)
    }
    this.lastError = new Error('Port already in use')
    this._stateTransition(processStates.start_error_port_used)
    return this.lastError
  }

  _shouldEmitExit () {
    return this.processState !== processStates.start_error_port_used || this.processState === processStates.start_error_unexpected
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
            reject(err)
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
            reject(error)
          } else {
            resolve()
          }
        })
      }
    })
  }
}
