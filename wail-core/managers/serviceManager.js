import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)

let debug = false

export default class ServiceManager {
  constructor (settings) {
    this._monitoring = new Map()
    this._pidStore = new Datastore({
      filename: path.join(settings.get('wailCore.db'), 'pids.db'),
      autoload: true
    })
    this._isWin = process.platform === 'win32'
    this._settings = settings
    this._pidStore.find({}, (error, pids) => {
      if (error) {
        console.error('there was an error in ServiceManage intit get persisted pids', error)
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

  killService (which) {
    if (which === 'all') {
      let forgetMe = []
      for (let [who, pid] of this._monitoring) {
        if (this.isServiceUp(who)) {
          console.log(`ServiceManager killing ${who}`)
          if (!this._isWin) {
            process.kill(pid, 'SIGTERM')
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
      })
    } else {
      let killMe = this._monitoring.get(which)
      if (killMe) {
        if (this.isServiceUp(which)) {
          if (!this._isWin) {
            process.kill(killMe, 'SIGTERM')
          } else {
            cp.exec('taskkill /PID ' + killMe + ' /T /F', (error, stdout, stderr) => {
              if (error) {
                console.error('really bad juju')
              }
            })
          }
        }
        this._pidStore.remove({ _id: which, who: which }, (error) => {
          if (error) {
            console.error(`ServiceManager error removing from pidstore ${which}`)
          } else {
            console.log(`ServiceManager removed ${which} from pidstore`)
          }
        })
      }
    }
  }

  startHeritrix () {
    console.log('service man starting heritrix')
    return new Promise((resolve,reject) => {
      if (this.isServiceUp('heritrix')) {
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
            stdio: [ 'ignore', 'ignore', 'ignore' ]
          }
          let usrpwrd = `${this._settings.get('heritrix.username')}:${this._settings.get('heritrix.password')}`
          let pid = -1
          try {
            let heritrix = cp.spawn('bin\\heritrix.cmd', [ '-a', `${usrpwrd}` ], opts)
            pid = heritrix.pid
            this._monitoring.set('heritrix', pid)
            heritrix.unref()
            this._pidStore.update({
              _id: 'heritrix',
              who: 'heritrix'
            }, { $set: { pid } }, { upsert: true }, insertError => {
              if (insertError) {
                console.error('service manager inserting pid error', insertError)
              } else {
                reject(insertError)
              }
              resolve()
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
              reject(err)
            } else {
              console.log(stdout, stderr)
              let pidLine = S(stdout).lines()[ 0 ]
              let maybepid = hpidGetter.exec(pidLine)
              if (maybepid) {
                let pid = S(maybepid.capture('hpid')).toInt()
                this._monitoring.set('heritrix', pid)
                console.log('Heritrix was started')
                this._pidStore.update({
                  who: 'heritrix',
                  _id: 'heritrix'
                }, { $set: { pid } }, { upsert: true }, insertError => {
                  if (insertError) {
                    console.error('service manager inserting pid error', insertError)
                    reject(insertError)
                  } else {
                    resolve()
                  }
                })
              } else {
                console.error('the pid extraction could not be done for heritrix')
                reject(err)
              }
            }
          })
        }
      }
    })
  }

  startWayback () {
    console.log('service man starting wayback')
    return new Promise((resolve,reject) => {
      if (this.isServiceUp('wayback')) {
        console.log('wayback was already up')
        resolve()
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
              reject(insertError)
            } else {
              resolve()
            }
          })
        } catch (err) {
          console.error('wayback could not be started', err)
          reject(err)
        }
      }
    })
  }
}
