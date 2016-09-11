import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'
import isRunning from 'is-running'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)

export default class ServiceDaemon {
  constructor (settings) {
    this._monitoring = new Map()
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  isServiceUp (which) {
    let hpid = this._monitoring.get(which)
    if (hpid) {
      return isRunning(hpid)
    } else {
      return false
    }
  }

  killService (which) {
    if (which === 'all') {
      let wasError = []
      for (let [k, v] of this._monitoring) {
        if (this.isServiceUp(k) && !v.error) {
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
        if (this.isServiceUp(which) && !killMe.error) {
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
    if (this._monitoring.get('heritrix')) {
      return Promise.resolve(true)
    }

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
        try {
          let heritrix = cp.spawn('bin\\heritrix.cmd', [ '-a', `${usrpwrd}` ], opts)
          this._monitoring.set('heritrix', {
            pid: heritrix.pid,
            error: false
          })
          heritrix.unref()
          resolve()
        } catch (err) {
          // why you no work???
          this._monitoring.set('heritrix', {
            pid: '',
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
              resolve()
            } else {
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
    if (this._monitoring.get('wayback')) {
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
        wayback.unref()
        resolve()
      } catch (err) {
        wasError = true
        this._monitoring.set('wayback', {
          pid: ' ',
          error: wasError
        })
        reject(err)
      }
    })
  }
}


