import 'babel-polyfill'
import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import Promise from 'bluebird'

const hpidGetter = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)

class ServiceDaemon {
  constructor (settings) {
    this._monitoring = new Map()
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  startSerivce (which) {
    let { one } = which
    if (one === 'heritrix') {
      return this._startHeritrix()
    } else if (one === 'wayback') {
      return this._startWayback()
    }
  }
  _startHeritrix () {
    return new Promise((resolve,reject) => {
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
          } else {
            let pidLine = S(stdout).lines()[ 0 ]
            let maybepid = hpidGetter.exec(pidLine)
            if (maybepid) {
              let pid = maybepid.capture('hpid')
              this._monitoring.set('heritrix', {
                pid,
                error: wasError
              })
            } else {
              wasError = true
              this._monitoring.set('heritrix', {
                pid: '',
                error: wasError
              })
            }
          }

        })
      }
    })
  }

  _startWayback () {
    return new Promise((resolve,reject) => {
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

export default function createServiceDaemon (settings) {
  return new ServiceDaemon(settings)
}
