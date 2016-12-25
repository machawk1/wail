import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'
import psTree from 'ps-tree'
import findP from 'find-process'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)
const hFindRegx = /(heritrix)|(java)/i

const bundledHeritrix = `bundledApps${path.sep}heritrix`

const wasHeritrixStartError = (out, err) => {
  let errOut = S(err)
  let wasStartErrorReport = {
    wasError: false,
    errorType: -1,
    errorMessage: '',
  }
  if (out.contains('exception') || errOut.contains('exception')) {
    wasStartErrorReport.wasError = true
    if (out.contains('java.net.BindException') || errOut.contains('java.net.BindException')) {
      wasStartErrorReport.errorType = 1
      wasStartErrorReport.errorMessage = 'Heritrix failed to start due to port in use'
    } else {
      wasStartErrorReport.errorType = 2
      wasStartErrorReport.errorMessage = 'Heritrix failed to start due to technical reasons'
    }
  }
  return wasStartErrorReport
}

const heritrixFinder = result => {
  let len = result.length, i = 0
  let findReport = {found: false, pid: -1, isWails: false}
  for (; i < len; ++i) {
    let {pid, cmd} = result[i]
    if (cmd.indexOf('heritrix') > 0) {
      findReport.found = true
      findReport.pid = pid
      if (cmd.indexOf(bundledHeritrix) > 0) {
        findReport.isWails = true
      }
      break
    }
  }
  return findReport
}

export default class ServiceManager {
  constructor (settings) {
    this._monitoring = new Map()
    this._pidStore = new Datastore({
      filename: path.join(settings.get('wailCore.db'), 'pids.db'),
      autoload: true
    })
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  init () {
    return new Promise((resolve, reject) => {
      this._pidStore.find({}, (error, pids) => {
        if (error) {
          console.error('there was an error in ServiceManage intit get persisted pids', error)
          reject(error)
        } else {
          if (pids.length > 0) {
            console.log('we have persisted pids')
            pids.forEach(pPid => {
              this._monitoring.set(pPid.who, pPid.pid)
            })
          } else {
            console.log('we do not have persisted pids')
          }
        }
        resolve()
      })
    })
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

  restartWayback () {
    console.log('restarting wayback')
    return this.killService('wayback')
      .then(() => {
        console.log('restarting wayback: it was killed')
        return this.startWayback()
      })
  }

  killService (which) {
    return new Promise((resolve, reject) => {
      if (which === 'all') {
        let forgetMe = []
        for (let [who, pid] of this._monitoring) {
          if (this.isServiceUp(who)) {
            console.log(`ServiceManager killing ${who}`)
            if (!this._isWin) {
              // process.kill(pid, 'SIGTERM')
              psTree(pid, (err, kids) => {
                console.log(kids)
                if (err) {
                  console.error('ps tree error', err)
                  process.kill(pid, 'SIGTERM')
                } else {
                  if (kids.length > 0) {
                    let dukeNukem = cp.spawn('kill', ['-9'].concat(kids.map(p => p.PID)), {
                      detached: true,
                      shell: true,
                      stdio: ['ignore', 'ignore', 'ignore']
                    })
                    dukeNukem.unref()
                  } else {
                    process.kill(pid, 'SIGTERM')
                  }
                }
              })
            } else {
              cp.exec('taskkill /PID ' + pid + ' /T /F', (error, stdout, stderr) => {
                if (error) {
                  console.error('really bad juju', stderr)
                }
              })
            }
          }
          forgetMe.push(who)
        }
        this._pidStore.remove({}, {multi: true}, (err) => {
          if (err) {
            console.error('there was an error removing all services', err)
          } else {
            console.log(`Removed all pids from the pidstore`)
          }
          forgetMe.forEach(fm => {
            this._monitoring.delete(fm)
          })
          resolve()
        })
      } else {
        if (this.isServiceUp(which)) {
          let pid = this._monitoring.get(which)
          if (!this._isWin) {
            // process.kill(killMe, 'SIGTERM')
            psTree(pid, (err, kids) => {
              console.log(kids)
              if (err) {
                console.error('ps tree error', err)
                process.kill(pid, 'SIGTERM')
              } else {
                if (kids.length > 0) {
                  let dukeNukem = cp.spawn('kill', ['-9'].concat(kids.map(p => p.PID)), {
                    detached: true,
                    shell: true,
                    stdio: ['ignore', 'ignore', 'ignore']
                  })
                  dukeNukem.unref()
                } else {
                  process.kill(pid, 'SIGTERM')
                }
              }
            })
          } else {
            cp.exec('taskkill /PID ' + pid + ' /T /F', (error, stdout, stderr) => {
              if (error) {
                console.error('really bad juju')
              }
            })
          }
        }
        this._monitoring.delete(which)
        this._pidStore.remove({_id: which, who: which}, (error) => {
          if (error) {
            console.error(`ServiceManager error removing from pidstore ${which}`)
          } else {
            console.log(`ServiceManager removed ${which} from pidstore`)
          }

          resolve()
        })
      }
    })
  }

  startHeritrix () {
    let {logger} = global
    console.log('service man starting heritrix')
    return new Promise((resolve, reject) => {
      if (this.isServiceUp('heritrix')) {
        if (logger) {
          logger.info('starting heritrix but it was up already')
        }
        console.log('heritrix is already up', this._monitoring)
        resolve()
      } else {
        console.log('heritrix is not up starting')

        if (this._isWin) {
          let heritrixPath = this._settings.get('heritrix.path')
          let opts = {
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
          let usrpwrd = `${this._settings.get('heritrix.username')}:${this._settings.get('heritrix.password')}`
          let pid = -1
          try {
            let heritrix = cp.spawn('bin\\heritrix.cmd', ['-a', `${usrpwrd}`], opts)
            pid = heritrix.pid
            this._monitoring.set('heritrix', pid)
            heritrix.unref()
            this._pidStore.update({
              _id: 'heritrix',
              who: 'heritrix'
            }, {$set: {pid}}, {upsert: true}, insertError => {
              if (insertError) {
                console.error('service manager inserting pid error', insertError)
                reject(insertError)
              } else {
                resolve()
              }
            })
          } catch (err) {
            // why you no work???
            reject(err)
          }
        } else {
          var hStart
          if (process.platform === 'darwin') {
            hStart = this._settings.get('heritrixStartDarwin')
          } else {
            hStart = this._settings.get('heritrixStart')
          }
          cp.exec(hStart, (err, stdout, stderr) => {
            if (err) {
              console.error('heritrix could not be started due to an error', err, stderr, stdout)
              if (logger) {
                logger.fatal({err, msg: `heritrix could not be started ${stderr}`})
              }
              reject(err)
            } else {
              console.log(stdout, stderr)
              let pidLine = S(stdout).lines()[0]
              let maybepid = hpidGetter.exec(pidLine)
              if (maybepid) {
                let pid = S(maybepid.capture('hpid')).toInt()
                this._monitoring.set('heritrix', pid)
                console.log('Heritrix was started')
                if (logger) {
                  logger.info(`heritrix was started ${pid} ${stderr} ${stdout}`)
                }
                this._pidStore.update({
                  who: 'heritrix',
                  _id: 'heritrix'
                }, {$set: {pid}}, {upsert: true}, insertError => {
                  if (insertError) {
                    if (logger) {
                      logger.fatal({err: insertError, msg: 'service manager inserting heritrix pid error'})
                    }
                    console.error('service manager inserting pid error', insertError)
                    reject(insertError)
                  } else {
                    resolve()
                  }
                })
              } else {
                if (logger) {
                  logger.fatal('the pid extraction could not be done for heritrix')
                }
                console.error('the pid extraction could not be done for heritrix')
                reject(err)
              }
            }
          })
        }
      }
    })
  }

  startHeritrixLoading () {
    return new Promise((resolve, reject) => {
      let {logger} = global
      console.log('service man starting heritrix loading')
      if (false) { //this.isServiceUp('heritrix')) {
        if (logger) {
          logger.info('starting heritrix but it was up already')
        }
        console.log('heritrix is already up', this._monitoring)
        resolve({wasError: false})
      } else {
        console.log('heritrix is not up starting')
        if (this._isWin) {
          return this._startHeritrixWin().then(didStart => {
            if (didStart.wasError) {
              if (didStart.errorType === 1) {
                return this._maybeFindHeritrixProcess(didStart, resolve, reject)
              } else {
                delete didStart.errorType
                resolve(didStart)
              }
            } else {
              resolve(didStart)
            }
          })
        } else {
          return this._startHeritrixNotWin(logger).then(didStart => {
            if (didStart.wasError) {
              if (didStart.errorType === 1) {
                return this._maybeFindHeritrixProcess(didStart, resolve, reject)
              } else {
                delete didStart.errorType
                resolve(didStart)
              }
            } else {
              resolve(didStart)
            }
          })
        }
      }
    })
  }

  startWayback () {
    console.log('service man starting wayback')
    let {logger} = global
    return new Promise((resolve, reject) => {
      if (this.isServiceUp('wayback')) {
        console.log('wayback was already up')
        if (logger) {
          logger.info('starting wayback but was already up')
        }
        resolve()
      } else {
        console.log('starting wayback')
        let exec = this._settings.get('pywb.wayback')
        let opts = {
          cwd: this._settings.get('pywb.home'),
          detached: true,
          shell: true,
          stdio: ['ignore', 'ignore', 'ignore']
        }
        try {
          let wayback = cp.spawn(exec, ['-d', this._settings.get('warcs')], opts)
          let pid = wayback.pid
          this._monitoring.set('wayback', pid)
          console.log('wayback was started', pid)
          wayback.unref()
          this._pidStore.update({
            who: 'wayback',
            _id: 'wayback'
          }, {$set: {pid}}, {upsert: true}, insertError => {
            if (insertError) {
              console.error('service manager inserting pid for wayback error', insertError)
              if (logger) {
                logger.fatal({msg: 'service manager inserting pid for wayback error', err: insertError})
              }
              reject(insertError)
            } else {
              if (logger) {
                logger.info(`wayback was started ${pid}`)
              }
              resolve()
            }
          })
        } catch (err) {
          if (logger) {
            logger.fatal({err, msg: 'wayback could not be started'})
          }
          console.error('wayback could not be started', err)
          reject(err)
        }
      }
    })
  }

  startWaybackLoading () {
    console.log('service man starting wayback')
    let {logger} = global
    return new Promise((resolve, reject) => {
      if (this.isServiceUp('wayback')) {
        console.log('wayback was already up')
        if (logger) {
          logger.info('starting wayback but was already up')
        }
        resolve({wasError: false})
      } else {
        console.log('starting wayback')
        let exec = this._settings.get('pywb.wayback')
        let opts = {
          cwd: this._settings.get('pywb.home'),
          detached: true,
          shell: true,
          stdio: ['ignore', 'ignore', 'ignore']
        }
        try {
          let wayback = cp.spawn(exec, ['-d', this._settings.get('warcs')], opts)
          let pid = wayback.pid
          this._monitoring.set('wayback', pid)
          console.log('wayback was started', pid)
          wayback.unref()
          this._pidStore.update({
            who: 'wayback',
            _id: 'wayback'
          }, {$set: {pid}}, {upsert: true}, insertError => {
            if (insertError) {
              console.error('service manager inserting pid for wayback error', insertError)
              if (logger) {
                logger.fatal({msg: 'service manager inserting pid for wayback error', err: insertError})
              }
              resolve({
                wasError: true,
                errorReport: {
                  error: insertError,
                  where: 'updating pid store'
                }
              })
            } else {
              if (logger) {
                logger.info(`wayback was started ${pid}`)
              }
              resolve({wasError: false})
            }
          })
        } catch (err) {
          if (logger) {
            logger.fatal({err, msg: 'wayback could not be started'})
          }
          console.error('wayback could not be started', err)
          resolve({
            wasError: true,
            errorReport: {
              error: err,
              where: 'Launching Wayack'
            }
          })
        }
      }
    })
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

  _startHeritrixWin () {
    return new Promise((resolve, reject) => {
      let opts = this._hStartOptsWin()
      let usrpwrd = `${this._settings.get('heritrix.username')}:${this._settings.get('heritrix.password')}`
      let pid = -1
      try {
        let heritrix = cp.spawn('bin\\heritrix.cmd', ['-a', `${usrpwrd}`], opts)
        pid = heritrix.pid
        this._monitoring.set('heritrix', pid)
        heritrix.unref()
        return this._updatePidStore(pid, 'heritrix')
          .then(() => { resolve({wasError: false}) })
          .catch(error => {
            resolve({
              wasError: true,
              errorReport: {
                error,
                where: 'updating the pidStore'
              }
            })
          })
      } catch (startError) {
        // why you no work???
        resolve({
          wasError: true,
          errorReport: {
            error: startError,
            where: 'Starting Heritrix'
          }
        })
      }
    })
  }

  _startHeritrixNotWin (logger) {
    return new Promise((resolve, reject) => {
      let hStart = this._hStartCmdNotWin()
      cp.exec(hStart, (err, stdout, stderr) => {
        if (err) {
          console.error('heritrix could not be started due to an error', err, stderr, stdout)
          if (logger) {
            logger.fatal({err, msg: `heritrix could not be started ${stderr}`})
          }
          resolve({
            wasError: true,
            errorReport: {
              error: err,
              where: stderr
            }
          })
        } else {
          console.log('heritrix was started')
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          let out = S(stdout)
          let {wasError, errorType, errorMessage} = wasHeritrixStartError(out, stderr)
          if (wasError) {
            console.error('heritrix could not be started due to an error', stderr, stdout)
            let theError = new Error(errorMessage)
            if (logger) {
              logger.fatal({err: theError, msg: `heritrix could not be started ${stdout} ${errorMessage}`})
            }
            resolve({
              wasError: true,
              errorType,
              errorReport: {
                error: theError,
                where: 'launching heritrix'
              }
            })
          } else {
            let pidLine = S(stdout).lines()[0]
            let maybepid = hpidGetter.exec(pidLine)
            if (maybepid) {
              let pid = S(maybepid.capture('hpid')).toInt()
              this._monitoring.set('heritrix', pid)
              console.log('Heritrix was started')
              if (logger) {
                logger.info(`heritrix was started ${pid} ${stderr} ${stdout}`)
              }
              return this._updatePidStore(pid, 'heritrix')
                .then(() => { resolve({wasError: false}) })
                .catch(error => {
                  resolve({
                    wasError: true,
                    errorType: 3,
                    errorReport: {
                      error,
                      where: 'updating the pidStore'
                    }
                  })
                })
            } else {
              if (logger) {
                logger.fatal('the pid extraction could not be done for heritrix')
              }
              console.error('the pid extraction could not be done for heritrix')
              resolve({
                wasError: true,
                errorType: 3,
                errorReport: {
                  error: new Error('the pid extraction could not be done for heritrix'),
                  where: 'Extracting pid'
                }
              })
            }
          }
        }
      })
    })
  }

  _maybeFindHeritrixProcess (didStart, resolve, reject) {
    return findP('name', hFindRegx).then(findResults => {
      let {found, pid, isWails} = heritrixFinder(findResults)
      if (found) {
        console.log(`there is a heritrix instance running pid=${pid}`)
        if (isWails) {
          console.log('it is wails')
          return this._updatePidStore(pid, 'heritrix').then(() => { resolve({wasError: false}) })
            .catch(error => {
              if (logger) {
                logger.fatal({err: error, msg: 'service manager inserting heritrix pid error'})
              }
              resolve({
                wasError: true,
                errorReport: {
                  error,
                  where: 'Internal'
                }
              })
            })
        } else {
          console.log('it is not wails')
          delete didStart.errorType
          resolve(didStart)
        }
      } else {
        delete didStart.errorType
        resolve(didStart)
      }
    })
  }
}
