import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)

export default class ServiceManager {
  constructor (settings) {
    this._monitoring = new Map()
    this._pidStore = new Datastore({
      filename: path.join(settings.get('wailCore.db'),'pids.db'),
      autoload: true
    })
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  init() {
    this._pidStore.find({},(error,pids) => {
      if(error){
        console.error('there was an error in ServiceManage intit get persisted pids',error)
      } else {
        if(pids.length > 0) {
          pids.forEach(pPid => {
            this._monitoring.set(pPid.who, {
              pid: pPid.pid,
              error: false
            })
          })
        }
      }
    })
  }

  isServiceUp (which) {
    let maybeUp = this._monitoring.get(which)
    if (maybeUp) {
      console.log(`checking serivce ${which}`, maybeUp)
      if (maybeUp.error) {
        return false
      } else {
        return isRunning(maybeUp.pid)
      }
    } else {
      console.log(`checking serivce ${which} has not been started`)
      return false
    }
  }

  killService (which) {
    if (which === 'all') {
      let wasError = []
      for (let [k, v] of this._monitoring) {
        if (this.isServiceUp(k)) {
          if (!this._isWin) {
            process.kill(v.pid, 'SIGTERM')
          } else {
            cp.exec('taskkill /PID ' + v.pid + ' /T /F', (error, stdout, stderr) => {
              if (error) {
                console.error('really bad juju')
              }
            })
          }
        }
      }
      return wasError
    } else {
      let killMe = this._monitoring.get(which)
      if (killMe) {
        if (this.isServiceUp(which)) {
          if (!this._isWin) {
            process.kill(killMe.pid, 'SIGTERM')
          } else {
            cp.exec('taskkill /PID ' + killMe.pid + ' /T /F', (error, stdout, stderr) => {
              if (error) {
                console.error('really bad juju')
              }
            })
          }
        }
      }
    }
  }

  startHeritrix () {
    console.log('starting heritrix')
    if (this.isServiceUp('heritrix')) {
      console.log('heritrix is already up')
      return Promise.resolve(true)
    }
    console.log('heritrix is not up starting')

    return new Promise((resolve, reject) => {
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
          this._monitoring.set('heritrix', {
            pid,
            error: false
          })
          heritrix.unref()
          resolve()
        } catch (err) {
          // why you no work???
          this._monitoring.set('heritrix', {
            pid,
            error: true
          })
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
          // console.log(hStart)
          // console.log(err, stdout, stderr)
          let wasError = false
          if (err) {
            console.error('heritrix could not be started due to an error', err, stderr, stdout)
            wasError = true
            this._monitoring.set('heritrix', {
              pid: '',
              error: wasError
            })
            reject(err)
          } else {
            let pidLine = S(stdout).lines()[ 0 ]
            let maybepid = hpidGetter.exec(pidLine)
            if (maybepid) {
              let pid = maybepid.capture('hpid')
              this._monitoring.set('heritrix', {
                pid: S(pid).toInt(),
                error: wasError
              })
              console.log('Heritrix was started')
              resolve()
            } else {
              console.error('the pid extraction could not be done for heritrix')
              wasError = true
              this._monitoring.set('heritrix', {
                pid: '',
                error: wasError
              })
              reject(err)
            }
          }
        })
      }
    })
  }

  startWayback () {
    console.log('starting wayback')
    if (this.isServiceUp('wayback')) {
      console.log('wayback was already up')
      return Promise.resolve(true)
    }

    return new Promise((resolve, reject) => {
      let exec = this._settings.get('pywb.wayback')
      let opts = {
        cwd: this._settings.get('pywb.home'),
        detached: true,
        shell: true,
        stdio: [ 'ignore', 'ignore', 'ignore' ]
      }
      let wasError = false
      try {
        let wayback = cp.spawn(exec, [ '-d', this._settings.get('warcs') ], opts)
        this._monitoring.set('wayback', {
          pid: wayback.pid,
          error: wasError
        })
        console.log('wayback was started')
        wayback.unref()
        resolve()
      } catch (err) {
        wasError = true
        console.error('wayback could not be started', err)
        this._monitoring.set('wayback', {
          pid: ' ',
          error: wasError
        })
        reject(err)
      }
    })
  }
}
