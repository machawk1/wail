import cp from 'child_process'
import Path from 'path'
import * as fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import { Observable } from 'rxjs'
import EventEmitter from 'eventemitter3'
import psTree from 'ps-tree'
import isRunning from 'is-running'
import {
  findProcessOnPort,
  checkProcessExists
} from '../../../util/serviceManHelpers'
import * as pcErrors from '../errors'
import processStates from './processStates'

export default class HeritrixProcessController extends EventEmitter {
  constructor (settings) {
    super()
    let heritrixPath = settings.get('heritrix.path')
    this._hopts = {
      cwd: heritrixPath,
      env: {
        JAVA_HOME: settings.get('jdk'),
        JRE_HOME: settings.get('jre'),
        HERITRIX_HOME: heritrixPath
      },
      detached: true,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    }
    this._userpass = `${settings.get('heritrix.username')}:${settings.get('heritrix.password')}`
    this._hHome = heritrixPath
    this._jobsDir = settings.get('heritrix.jobsDir')
    this._isListening = false
    this._hportInUseMessage = 'Exception in thread "main" java.net.BindException: Address already in use'
    this._noFindMainClass = 'Error: Could not find or load main class org.archive.crawler.Heritrix'
    this.lastError = null
    this.process = null
    this.pid = null
    this.prevProcessState = null
    this.processState = processStates.not_started
    this._processEventsObservable = null
    this.checkIfAlive = this.checkIfAlive.bind(this)
  }

  heritrixTest (found) {
    return found.cmd.indexOf('-Dheritrix.home=/home/john/my-fork-wail/bundledApps/heritrix') !== -1 && found.name === 'java'
  }

  async checkIfPortTaken () {
    let maybeOnPort
    try {
      maybeOnPort = await findProcessOnPort(8443)
    } catch (err) {
      return {portTaken: false}
    }
    if (maybeOnPort.found) {
      if (maybeOnPort.whoOnPort.pname === 'java') {
        let heritrixProcesses = await checkProcessExists(this.heritrixTest, 'name', 'heritrix')
        if (heritrixProcesses.found && heritrixProcesses.wails) {
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

  async launchHeritrix () {
    if (this._shouldStart()) {
      let check = await this.checkIfPortTaken()
      console.log(check)
      if (!check.portTaken) {
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
        if (check.wails) {
          this.handleExistingProcessOurs(parseInt(check.pid))
          return this.processState
        } else {
          throw new pcErrors.ServicesPortTakenError('heritrix', 8443)
        }
      }
    } else {
      return this.processState
    }
  }

  async killProcess () {
    if (this.process && this.isProcessStarted()) {
      // the pid given to use by the childProcess is the PPID not PID
      // so gotta do it the long way
      await this._doKillProcess()
      this.process = null
      this._isListening = false
      if (this.existingCheckInterval) {
        clearInterval(this.existingCheckInterval)
        this.existingCheckInterval = null
        this._stateTransition(processStates.not_started)
        this.emit('heritrix-exited', {prev: this.prevProcessState, cur: this.processState, code: 999})
      }
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

  _makehlc1 (CLASSPATH) {
    const JAVACMD = Path.join(this._hopts.env.JAVA_HOME, 'bin', 'java')
    if (process.platform === 'win32') {
      return `${JAVACMD} -Dje.disable.java.adler32=true -Dname=heritrix -Dheritrix.home=${this._hHome}`
    } else {
      return `CLASSPATH=${CLASSPATH} ${JAVACMD} -Dname=heritrix -Dheritrix.home=${this._hHome}`
    }
  }

  _doLaunch (CLASSPATH) {
    this._processStarting()
    const javaOpts = ' -Xmx256m', CLASS_MAIN = 'org.archive.crawler.Heritrix'
    const HERITRIX_OUT = Path.join(this._hHome, 'heritrix_out.log')
    const hlc1 = this._makehlc1(CLASSPATH)
    const hlc2 = `-Djava.protocol.handler.pkgs=org.archive.net -Dheritrix.out=${HERITRIX_OUT} ${javaOpts} ${CLASS_MAIN}`
    const heritrixLaunchCommand = `${hlc1} ${hlc2}`
    const args = ['-a', this._userpass, '--jobs-dir', this._jobsDir]
    return new Promise((resolve, reject) => {
      const swapper = S('')
      this.process = cp.spawn(heritrixLaunchCommand, args, this._hopts)
      this.process.on('error', (err) => {
        // console.log('Failed to start child process.', err)
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
    this.lastError = new pcErrors.BuildHeritrixClassPathError(error)
    throw error
  }

  isProcessStarting () {
    return this.processState === processStates.starting
  }

  isProcessStarted () {
    return this.processState === processStates.started
  }

  handleExistingProcessOurs (pid) {
    this.prevProcessState = processStates.starting
    this.processState = processStates.started
    this.process = {pid}
    this.pid = pid
    this.existingCheckInterval = setInterval(this.checkIfAlive, 1000 * 120) // check every 2min
    this.emit('heritrix-started', {prev: this.prevProcessState, cur: this.processState})
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

  _shouldEmitExit () {
    return !(
      this.processState === processStates.start_error_port_used ||
      this.processState === processStates.start_error_unexpected ||
      this.prevProcessState === processStates.start_error_main_not_found
    )
  }

  _shouldStart () {
    return !(this.isProcessStarted() || this.isProcessStarting())
  }

  _processExited (code) {
    if (this._shouldEmitExit()) {
      this._stateTransition(processStates.not_started)
      this.emit('heritrix-exited', {prev: this.prevProcessState, cur: this.processState, code})
    }
  }

  _startErrorPortUsed () {
    this.lastError = new pcErrors.ServicesPortTakenError('heritrix', 8443)
    this._stateTransition(processStates.start_error_port_used)
    return this.lastError
  }

  _isUnexpectedStartExit () {
    if (!this._isListening) {
      return this.processState === processStates.starting
    }
    return false
  }

  _unexpectedStartProcessError (err) {
    this._maybeClearExistingInterval()
    this._stateTransition(processStates.start_error_unexpected)
    return new pcErrors.ServiceFatalProcessError('heritrix', err)
  }

  _unexpectedStartExit (code) {
    this._maybeClearExistingInterval()
    this._stateTransition(processStates.start_error)
    return new pcErrors.ServiceUnexpectedStartError('heritrix', code)
  }

  _couldNotFindMain () {
    this._stateTransition(processStates.start_error_main_not_found)
    return new pcErrors.CouldNotFindHeritrixMainClassError(new Error(this._noFindMainClass))
  }

  _killProcessFailed () {
    this._stateTransition(processStates.could_not_kill)
    this.emit('heritrix-kill-process-failed', {prev: this.prevProcessState, cur: this.processState})
  }

  _hardProcessError (err) {
    this._maybeClearExistingInterval()
    this._stateTransition(processStates.process_error)
    this.lastError = new pcErrors.ServiceFatalProcessError('heritrix', err)
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
            reject(new pcErrors.KillServiceError('heritrix', 'psTree', err))
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
            reject(new pcErrors.KillServiceError('heritrix', 'taskkill', error))
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
            reject(new Error(this._noFindMainClass))
          }
        }
      })
    })
  }
}
