import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'
import psTree from 'ps-tree'
import findP from 'find-process'
import {
  findProcessOnHeritrixPort,
  findHPidWindows,
  findWbPidWindows,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport
} from '../util/serviceManHelpers'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)
const hFindRegx = /(heritrix)|(java)/i

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
        for (let [ who, pid ] of this._monitoring) {
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
                    let dukeNukem = cp.spawn('kill', [ '-9' ].concat(kids.map(p => p.PID)), {
                      detached: true,
                      shell: true,
                      stdio: [ 'ignore', 'ignore', 'ignore' ]
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
        this._pidStore.remove({}, { multi: true }, (err) => {
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
                  let dukeNukem = cp.spawn('kill', [ '-9' ].concat(kids.map(p => p.PID)), {
                    detached: true,
                    shell: true,
                    stdio: [ 'ignore', 'ignore', 'ignore' ]
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
        this._pidStore.remove({ _id: which, who: which }, (error) => {
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
    let { logger } = global
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
          return this._startHeritrixWin().then(didStart => {
            if (didStart.wasError) {
              reject(didStart.errorReport.error)
            } else {
              resolve()
            }
          })
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
                logger.fatal({ err, msg: `heritrix could not be started ${stderr}` })
              }
              reject(err)
            } else {
              console.log(stdout, stderr)
              let pidLine = S(stdout).lines()[ 0 ]
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
                }, { $set: { pid } }, { upsert: true }, insertError => {
                  if (insertError) {
                    if (logger) {
                      logger.fatal({ err: insertError, msg: 'service manager inserting heritrix pid error' })
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
      let { logger } = global
      console.log('service man starting heritrix loading')
      if (this.isServiceUp('heritrix')) {
        if (logger) {
          logger.info('starting heritrix but it was up already')
        }
        console.log('heritrix is already up', this._monitoring)
        resolve({ wasError: false })
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
    let { logger } = global
    return new Promise((resolve, reject) => {
      if (this.isServiceUp('wayback')) {
        console.log('wayback was already up')
        if (logger) {
          logger.info('starting wayback but was already up')
        }
        resolve()
      } else {
        if (process.platform === 'win32') {
          return this._startWaybackWin(logger)
            .then(result => {
              if (result.wasError) {
                reject(result.errorReport.error)
              } else {
                resolve()
              }
            })
        } else {
          console.log('starting wayback')
          let exec = this._settings.get('pywb.wayback')
          let opts = {
            cwd: this._settings.get('pywb.home'),
            detached: true,
            shell: true,
            stdio: [ 'ignore', 'ignore', 'ignore' ]
          }
          try {
            let wayback = cp.spawn(exec, [ '-d', this._settings.get('warcs') ], opts)
            let pid = wayback.pid
            this._monitoring.set('wayback', pid)
            console.log('wayback was started', pid)
            wayback.unref()
            this._pidStore.update({
              who: 'wayback',
              _id: 'wayback'
            }, { $set: { pid } }, { upsert: true }, insertError => {
              if (insertError) {
                console.error('service manager inserting pid for wayback error', insertError)
                if (logger) {
                  logger.fatal({ msg: 'service manager inserting pid for wayback error', err: insertError })
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
              logger.fatal({ err, msg: 'wayback could not be started' })
            }
            console.error('wayback could not be started', err)
            reject(err)
          }
        }
      }
    })
  }

  startWaybackLoading () {
    console.log('service man starting wayback')
    let { logger } = global
    return new Promise((resolve, reject) => {
      if (this.isServiceUp('wayback')) {
        console.log('wayback was already up')
        if (logger) {
          logger.info('starting wayback but was already up')
        }
        resolve({ wasError: false })
      } else {
        if (process.platform === 'win32') {
          return this._startWaybackWin(logger).then(result => { resolve(result) })
        } else {
          console.log('starting wayback')
          let exec = this._settings.get('pywb.wayback')
          let opts = {
            cwd: this._settings.get('pywb.home'),
            detached: true,
            shell: true,
            stdio: [ 'ignore', 'ignore', 'ignore' ]
          }
          try {
            let wayback = cp.spawn(exec, [ '-d', this._settings.get('warcs') ], opts)
            let pid = wayback.pid
            this._monitoring.set('wayback', pid)
            console.log('wayback was started', pid)
            wayback.unref()
            this._pidStore.update({
              who: 'wayback',
              _id: 'wayback'
            }, { $set: { pid } }, { upsert: true }, insertError => {
              if (insertError) {
                console.error('service manager inserting pid for wayback error', insertError)
                if (logger) {
                  logger.fatal({ msg: 'service manager inserting pid for wayback error', err: insertError })
                }
                resolve({
                  wasError: true,
                  errorReport: {
                    error: insertError.message,
                    where: 'updating pid store'
                  }
                })
              } else {
                if (logger) {
                  logger.info(`wayback was started ${pid}`)
                }
                resolve({ wasError: false })
              }
            })
          } catch (err) {
            if (logger) {
              logger.fatal({ err, msg: 'wayback could not be started' })
            }
            console.error('wayback could not be started', err)
            resolve({
              wasError: true,
              errorReport: {
                error: err.message,
                where: 'Launching Wayack'
              }
            })
          }
        }
      }
    })
  }

  _updatePidStore (pid, who) {
    return new Promise((resolve, reject) => {
      this._pidStore.update({ _id: who, who }, { $set: { pid } }, { upsert: true }, insertError => {
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
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
  }

  _startWaybackWin (logger) {
    return new Promise((resolve, reject) => {
      let exec = this._settings.get('pywb.wayback')
      let opts = {
        cwd: this._settings.get('pywb.home'),
        detached: true,
        shell: true,
        stdio: [ 'ignore', 'ignore', 'ignore' ]
      }
      try {
        let wayback = cp.spawn(exec, [ '-d', this._settings.get('warcs') ], opts)
        wayback.unref()
        return findWbPidWindows()
          .then(result => {
            if (result.found) {
              console.log('wayback pid was found')
              this._monitoring.set('wayback', result.pid)
              return this._updatePidStore(result.pid, 'wayback').then(() => {
                if (logger) {
                  logger.info(`wayback was started ${result.pid}`)
                }
                console.log('resolving waybackpid')
                resolve({ wasError: false })
              })
                .catch(error => {
                  resolve({
                    wasError: true,
                    errorReport: {
                      error,
                      where: 'updating the pidStore'
                    }
                  })
                })
            } else {
              resolve({
                wasError: true,
                errorReport: {
                  error: new Error('Could not find wayback pid'),
                  where: 'Starting Wayback'
                }
              })
            }
          })
      } catch (err) {
        if (logger) {
          logger.fatal({ err, msg: 'wayback could not be started' })
        }
        console.error('wayback could not be started', err)
        resolve({
          wasError: true,
          errorReport: {
            error: err.message,
            where: 'Launching Wayack'
          }
        })
      }
    })
  }

  _startHeritrixWin () {
    return new Promise((resolve, reject) => {
      let opts = this._hStartOptsWin()
      let usrpwrd = `${this._settings.get('heritrix.username')}:${this._settings.get('heritrix.password')}`
      let pid = -1
      let args = [ '-a', `${usrpwrd}`, '--jobs-dir', `${this._settings.get('heritrix.jobsDir')}` ]
      try {
        let heritrix = cp.spawn('bin\\heritrix.cmd', args, opts)
        heritrix.unref()
        return findHPidWindows()
          .then(result => {
            if (result.found) {
              this._monitoring.set('heritrix', result.pid)
              return this._updatePidStore(result.pid, 'heritrix')
                .then(() => { resolve({ wasError: false }) })
                .catch(error => {
                  resolve({
                    wasError: true,
                    errorReport: {
                      error,
                      where: 'updating the pidStore'
                    }
                  })
                })
            } else {
              resolve({
                wasError: true,
                errorType: 2,
                errorReport: {
                  error: new Error('Could not find heritrix pid'),
                  where: 'Starting Heritrix'
                }
              })
            }
          })
      } catch (startError) {
        // why you no work???
        resolve({
          wasError: true,
          errorType: 2,
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
            logger.fatal({ err, msg: `heritrix could not be started ${stderr}` })
          }
          resolve({
            wasError: true,
            errorType: 4,
            errorReport: {
              error: err.message,
              where: 'Launch Heritrix Technical Reason'
            }
          })
        } else {
          console.log('heritrix was started')
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          let out = S(stdout)
          let { wasError, errorType, errorMessage } = wasHeritrixStartError(out, stderr)
          if (wasError) {
            console.error('heritrix could not be started due to an error', stderr, stdout)
            let theError = new Error(errorMessage)
            if (logger) {
              logger.fatal({ err: theError, msg: `heritrix could not be started ${stdout} ${errorMessage}` })
            }
            resolve({
              wasError: true,
              errorType,
              errorReport: {
                error: errorMessage,
                where: 'Launching Heritrix'
              }
            })
          } else {
            let pidLine = S(stdout).lines()[ 0 ]
            let maybepid = hpidGetter.exec(pidLine)
            if (maybepid) {
              let pid = S(maybepid.capture('hpid')).toInt()
              this._monitoring.set('heritrix', pid)
              console.log('Heritrix was started')
              if (logger) {
                logger.info(`heritrix was started ${pid} ${stderr} ${stdout}`)
              }
              return this._updatePidStore(pid, 'heritrix').then(() => { resolve({ wasError: false }) })
                .catch(error => {
                  resolve({
                    wasError: true,
                    errorType: 3,
                    errorReport: {
                      error: error.message,
                      where: 'Updating the pidStore'
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
                  error: 'the pid extraction could not be done for heritrix',
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
    let { logger } = global
    return findP('name', hFindRegx).then(findResults => {
      let { found, pid, isWails } = heritrixFinder(findResults)
      if (found) {
        console.log(`there is a heritrix instance running pid=${pid}`)
        if (isWails) {
          console.log('it is wails')
          return this._updatePidStore(pid, 'heritrix').then(() => { resolve({ wasError: false }) })
            .catch(error => {
              if (logger) {
                logger.fatal({ err: error, msg: 'service manager inserting heritrix pid error' })
              }
              resolve(heritrixLaunchErrorReport(error.message, 'Internal'))
            })
        } else {
          console.log('it is not wails')
          resolve(heritrixLaunchErrorReport("Another Heritrix instance not under WAIL's control is in use", 'Launching Heritrix'))
        }
      } else {
        return findProcessOnHeritrixPort()
          .then(({ found, whoOnPort: { pid, pname } }) => {
            // who's on first?
            let eMessage, where = 'Launching Heritrix'
            if (found) {
              console.log(pid, pname)
              eMessage = `Another process[name=${pname}, pid=${pid}] is using the port[8443] that Heritrix uses`
            } else {
              console.log('couldnt find who is on port')
              eMessage = 'Another process is using the port[8443] that Heritrix uses. But WAIL could not determine which one'
            }
            resolve(heritrixLaunchErrorReport(eMessage, where))
          })
          .catch(() => {
            let eMessage = 'Another process is using the port[8443] that Heritrix uses. But WAIL could not determine which one'
            let where = 'Launching Heritrix'
            resolve(heritrixLaunchErrorReport(eMessage, where))
          })
      }
    })
  }
}
