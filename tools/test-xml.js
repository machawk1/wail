const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const Path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const moment = require('moment')
const psTree = require('ps-tree')
const fs = Promise.promisifyAll(require('fs-extra'))
const EventEmitter = require('eventemitter3')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const Rx = require('rxjs/Rx')
const rp = require('request-promise')
const normalizeUrl = require('normalize-url')
const findP = require('find-process')
const isRunning = require('is-running')
const keyMirror = require('keymirror')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

// Promise.promisfyAll(fs)

//

// var observable = Rx.Observable.create(function (observer) {
//   observer.next(1)
//   observer.next(2)
//   observer.next(3)
//   setTimeout(() => {
//     observer.next(4)
//     observer.complete()
//   }, 1000)
// })

const readDir = dirPath => new Promise((resolve, reject) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      reject(err)
    } else {
      resolve(files)
    }
  })
})

const heritrixClassPath = libDir => new Promise((resolve, reject) => {
  fs.readdir(libDir, (err, files) => {
    if (err) {
      reject(err)
    } else {
      const cp = [], swapper = S('')
      let i = 0, len = files.length
      for (; i < len; ++i) {
        let file = files[i]
        if (swapper.setValue(file).endsWith('.jar')) {
          cp.push(Path.join(libDir, file))
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

const heritrixOps = () => ({
  cwd: '/home/john/my-fork-wail/bundledApps/heritrix',
  env: {
    JAVA_HOME: '/home/john/my-fork-wail/bundledApps/openjdk',
    JRE_HOME: '/home/john/my-fork-wail/bundledApps/openjdk',
    HERITRIX_HOME: '/home/john/my-fork-wail/bundledApps/heritrix'
  },
  detached: true,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
})

const HERITRIX_NOT_RUNNING = Symbol('HERITRIX_NOT_RUNNING')
const HERITRIX_RUNNING = Symbol('HERITRIX_RUNNING')

const HERITRIX_STARTING = Symbol('HERITRIX_STARTING')

const HERITRIX_STARTED = Symbol('HERITRIX_STARTED')
const HERITRIX_START_ERROR = Symbol('HERITRIX_START_ERROR')

const HERITRIX_NOT_STARTED = Symbol('HERITRIX_NOT_STARTED')

const processStates = keyMirror({
  starting: null,
  started: null,
  start_error: null,
  do_restart: null,
  restarting: null,
  restarting_killed: null,
  start_error_unexpected: null,
  start_error_port_used: null,
  start_error_main_not_found: null,
  not_started: null,
  user_initiated_stop: null,
  could_not_kill: null,
  process_error: null,
})

class HeritrixProcessController extends EventEmitter {
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
    }
  }

  observe (handler) {
    if (!this._processEventsObservable) {
      this._processEventsObservable = Rx.Observable.fromEventPattern(
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

    return this._processEventsObservable.subscribe(handler)
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
        console.log('Failed to start child process.', err)
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
    this._stateTransition(processStates.not_started)
    this.emit('heritrix-exited', {prev: this.prevProcessState, cur: this.processState, code})
  }

  _startErrorPortUsed () {
    this.lastError = new Error(this._hportInUseMessage)
    this._stateTransition(processStates.start_error_port_used)
    return this.lastError
  }

  _killProcessFailed () {
    this._stateTransition(processStates.could_not_kill)
    this.emit('heritrix-kill-process-failed', {prev: this.prevProcessState, cur: this.processState})
  }

  _hardProcessError () {
    this._stateTransition(processStates.process_error)
    this.emit('heritrix-process-fatal-error', {prev: this.prevProcessState, cur: this.processState})
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

class WaybackProcessController extends EventEmitter {
  constructor (wbExe, colDir, opts) {
    super()
    this._opts = opts
    this._wbExe = wbExe
    this._colDir = colDir
    this._isListening = false
    this._isRestarting = false
    this.lastError = null
    this.process = null
    this.pid = null
    this.prevProcessState = null
    this.processState = processStates.not_started
    this._processEventsObservable = null
    this._processStartDelay = null
    this._porcessRestartExitOb = Rx.Observable.fromEventPattern(
      (handler) => {
        // add
        this.on('wayback-restart-exit', handler)
      },
      (handler) => {
        // remove
        this.removeListener('wayback-restart-exit', handler)
      }
    )
    this._porcessRestartExitSub = null
  }

  async launchWayback () {
    if (this._shouldStart()) {
      console.log('launching wayback')
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
        if (this._isRestarting) {
          await this._doKillProcessRestarting()
        } else {
          await this._doKillProcess()
        }
      } catch (err) {
        this.lastError = err
        this._killProcessFailed()
      }
      this.process = null
      this._isListening = false
    }
  }

  async restart () {
    this._isRestarting = true
    await this.killProcess()
    this._isRestarting = false
    this.removeAllListeners('wayback-restart-exit')
    await this.launchWayback()
    console.log('restarting finished')
  }

  _resolveOnRestartExit () {
    const log = console.log.bind(console)
    return new Promise((resolve, reject) => {
      this._porcessRestartExitSub = this._porcessRestartExitOb.subscribe((code) => {
        log('restart exit with', code)
        resolve()
      })
    })
  }

  observe (subscriber) {
    if (!this._processEventsObservable) {
      this._processEventsObservable = Rx.Observable.fromEventPattern(
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
    console.log('start delay')
    this._processStartDelay = setTimeout(() => {
      clearTimeout(this._processStartDelay)
      this._processStartDelay = null
      resolve(this._engineListening())
    }, 3000)
  }

  _stateTransition (nextState) {
    this.prevProcessState = this.processState
    this.processState = nextState
    console.log(`state transition ${this.prevProcessState} -> ${this.processState}`)
  }

  _shouldStart () {
    return !(this.isProcessStarted() || this.isProcessStarting())
  }

  _processStarting () {
    console.log('process starting')
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
    } else if (this._isRestarting) {
      console.log('process exited but we are restarting')
      this._stateTransition(processStates.not_started)
      this.emit('wayback-restart-exit', code)
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
    console.log('engine listening', this.pid)
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

  _doKillProcessRestarting () {
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
              dukeNukem.unref()
              this.on('wayback-restart-exit', (code) => {
                console.log('we have the restart exit', code)
                resolve()
              })
            } else {
              process.kill(this.process.pid, 'SIGTERM')
              this.on('wayback-restart-exit', (code) => {
                console.log('we have the restart exit', code)
                resolve()
              })
            }
          }
        })
      } else {
        cp.exec(`taskkill /PID ${this.process.pid} /T /F`, (error, stdout, stderr) => {
          if (error) {
            reject(error)
          } else {
            this.on('wayback-restart-exit', (code) => {
              console.log('we have the restart exit', code)
              resolve()
            })
          }
        })
      }
    })
  }
}

let exec = '/home/john/my-fork-wail/bundledApps/pywb/wayback'
let opts = {
  cwd: '/home/john/my-fork-wail/bundledApps/pywb',
  detached: true,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
}

// let wayback = cp.spawn(exec, ['-d', '/home/john/Documents/WAIL_ManagedCollections'], opts)

// //stderr: Error: Could not find or load main class org.archive.crawler.Heritrix
const hpm = new WaybackProcessController('/home/john/my-fork-wail/bundledApps/pywb/wayback',
  '/home/john/Documents/WAIL_ManagedCollections', opts)

hpm.observe((event) => {
  console.log(event)
  if (event.prev === processStates.restarting) {
    console.log('goodby')
    process.exit(0)
  }
  if (event.cur === processStates.not_started) {

  }
})

hpm.launchWayback()
  .then(() => {
    console.log('launched', hpm._shouldStart())
    var numbers = Rx.Observable.timer(1000, 1000)
    numbers.subscribe(async x => {
      console.log(x)
      if (x === 5) {
        await hpm.restart()
        // process.exit(0)
        // process.kill(hpm.pid, 'SIGTERM')
      }
    })
  })
  .catch(error => {
    console.error('launch failure', error)
  })