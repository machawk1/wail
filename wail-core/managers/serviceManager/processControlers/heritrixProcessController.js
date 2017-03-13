import cp from 'child_process'
import Path from 'path'
import * as fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import { Observable } from 'rxjs'
import EventEmitter from 'eventemitter3'
import psTree from 'ps-tree'
import processStates from './processStates'

export default class HeritrixProcessController extends EventEmitter {
  constructor (hHome, jobsDir, hopts) {
    super()
    this._hopts = hopts
    this._hHome = hHome
    this._jobsDir = jobsDir
    this._isListening = false
    this._hportInUseMessage = 'Exception in thread "main" java.net.BindException: Address already in use'
    this._noFindMainClass = 'Error: Could not find or load main class org.archive.crawler.Heritrix'
    this.lastError = null
    this.process = null
    this.pid = null
    this.prevProcessState = null
    this.processState = processStates.not_started
    this._processEventsObservable = null
  }

  async launchHeritrix () {
    if (this._shouldStart()) {
      let CLASSPATH, libDir = Path.join(this._hHome, 'lib')
      try {
        CLASSPATH = await HeritrixProcessController.heritrixClassPath(libDir)
      } catch (error) {
        return this._couldNotBuildClasspath(error)
      }
      let ret = await this._doLaunch(CLASSPATH)
      this.emit('heritrix-started', {prev: this.prevProcessState, cur: this.processState})
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
          this.on('heritrix-started', handler)
          this.on('heritrix-exited', handler)
          this.on('heritrix-kill-process-failed', handler)
          this.on('heritrix-process-fatal-error', handler)
        },
        (handler) => {
          // remove
          this.removeListener('heritrix-started', handler)
          this.removeListener('heritrix-exited', handler)
          this.removeListener('heritrix-kill-process-failed', handler)
          this.removeListener('heritrix-process-fatal-error', handler)
        }
      )
    }

    return this._processEventsObservable.subscribe(subscriber)
  }

  _doLaunch (CLASSPATH) {
    this._processStarting()
    const javaOpts = ' -Xmx256m', CLASS_MAIN = 'org.archive.crawler.Heritrix'
    const HERITRIX_OUT = Path.join(this._hHome, 'heritrix_out.log'), JAVACMD = Path.join(this._hopts.env.JAVA_HOME, 'bin', 'java')
    const hlc1 = `CLASSPATH=${CLASSPATH} ${JAVACMD} -Dname=heritrix -Dheritrix.home=${this._hHome}`
    const hlc2 = `-Djava.protocol.handler.pkgs=org.archive.net -Dheritrix.out=${HERITRIX_OUT} ${javaOpts} ${CLASS_MAIN}`
    const heritrixLaunchCommand = `${hlc1} ${hlc2}`
    const args = ['-a', 'lorem:ipsum', '--jobs-dir', this._jobsDir]
    return new Promise((resolve, reject) => {
      const swapper = S('')
      this.process = cp.spawn(heritrixLaunchCommand, args, this._hopts)
      this.process.on('error', (err) => {
        // console.log('Failed to start child process.', err)
        if (this._isUnexpectedStartExit()) {
          // we have not handled this and we are starting
          reject(this._unexpectedStartExit(-999))
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

      this.process.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`)
        if (!this._isListening) {
          swapper.setValue(data)
          if (swapper.contains('engine listening at port 8443')) {
            resolve(this._engineListening())
          }
        }
      })

      this.process.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        if (!this._isListening) {
          swapper.setValue(data)
          if (swapper.contains(this._hportInUseMessage)) {
            reject(this._startErrorPortUsed())
          } else if (swapper.contains(this._noFindMainClass)) {
            reject(this._couldNotFindMain())
          }
        }
      })
    })
  }

  _couldNotBuildClasspath (error) {
    this._stateTransition(processStates.start_error)
    this.lastError = error
    throw error
  }

  isProcessStarting () {
    return this.processState === processStates.starting
  }

  isProcessStarted () {
    return this.processState === processStates.started
  }

  _shouldStart () {
    return !(this.isProcessStarted() || this.isProcessStarting())
  }

  _processExited (code) {
    if (this.processState !== processStates.start_error_port_used) {
      this._stateTransition(processStates.not_started)
      this.emit('heritrix-exited', {prev: this.prevProcessState, cur: this.processState, code})
    }
  }

  _startErrorPortUsed () {
    this.lastError = new Error(this._hportInUseMessage)
    this._stateTransition(processStates.start_error_port_used)
    return this.lastError
  }

  _isUnexpectedStartExit () {
    if (!this._isListening) {
      return this.processState === processStates.starting
    }
    return false
  }

  _unexpectedStartExit (code) {
    this._stateTransition(processStates.start_error)
    return new Error(`Heritrix Unexpectedly exited during start up with code: ${code}`)
  }

  _couldNotFindMain () {
    this._stateTransition(processStates.start_error_main_not_found)
    return new Error(this._noFindMainClass)
  }

  _killProcessFailed () {
    this._stateTransition(processStates.could_not_kill)
    this.emit('heritrix-kill-process-failed', {prev: this.prevProcessState, cur: this.processState})
  }

  _hardProcessError () {
    this._stateTransition(processStates.process_error)
    this.emit('heritrix-process-fatal-error', {prev: this.prevProcessState, cur: this.processState})
  }

  _engineListening () {
    this.pid = this.process.pid
    this.process.unref()
    this._isListening = true
    this._stateTransition(processStates.started)
    // kill piped stdout/stderr read streams we know we have started correctly
    // heritrix logs every action to these streams, keep our event loop for us only
    this.process.stdout.destroy()
    this.process.stderr.destroy()
    return this.processState
  }

  _processStarted () {
    this.processState = processStates.started
  }

  _processStarting () {
    if (this.lastError) {
      this.lastError = null
    }
    this._stateTransition(processStates.starting)
  }

  _stateTransition (nextState) {
    this.prevProcessState = this.processState
    this.processState = nextState
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

  static heritrixClassPath (heritrixLibDir) {
    return new Promise((resolve, reject) => {
      fs.readdir(heritrixLibDir, (err, files) => {
        if (err) {
          reject(err)
        } else {
          const cp = [], swapper = S('')
          let i = 0, len = files.length
          for (; i < len; ++i) {
            let file = files[i]
            if (swapper.setValue(file).endsWith('.jar')) {
              cp.push(Path.join(heritrixLibDir, file))
            }
          }
          if (cp.length > 0) {
            resolve(cp.join(':'))
          } else {
            reject(new Error('no classpath'))
          }
        }
      })
    })
  }

}
