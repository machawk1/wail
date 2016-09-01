import 'babel-polyfill'
import { remote, ipcRender } from 'electron'
import cp from 'child_process'

const settings = remote.get('settings')

class ServiceDaemon {
  constructor () {
    this._monitoring = {}
    this._isWin = process.platform === 'win32'
  }

  startSerivce (reply, which) {
    if (which.isHeritrix) {
      this._startHeritrix()
    }
  }

  _startHeritrix(){
    if (this._isWin) {
      let heritrixPath = settings.get('heritrix.path')
      let opts = {
        cwd: heritrixPath,
        env: {
          JAVA_HOME: settings.get('jdk'),
          JRE_HOME: settings.get('jre'),
          HERITRIX_HOME: heritrixPath
        },
        detached: true,
        shell: true,
        stdio: [ 'ignore', 'ignore', 'ignore' ]
      }
      let usrpwrd = `${settings.get('heritrix.username')}:${settings.get('heritrix.password')}`
      try {
        let heritrix = cp.spawn('bin\\heritrix.cmd', [ '-a', `${usrpwrd}` ], opts)
        this._monitoring['heritrix'] = heritrix.pid
        heritrix.unref()
      } catch (err) {
        // why you no work???
      }
    }
  }
}

if (process.platform === 'win32') {


} else {
  var hStart
  if (process.platform === 'darwin') {
    hStart = settings.get('heritrixStartDarwin')
  } else {
    hStart = settings.get('heritrixStart')
  }
  childProcess.exec(hStart, (err, stdout, stderr) => {
    // console.log(hStart)
    // console.log(err, stdout, stderr)
    if (err) {
      logger.error(util.format('Loading Actions %s, %s', `linux/osx launch heritrix ${stderr}`, err))
      return reject(err)
    }
    return resolve()
  })
}

ipcRenderer.on('start-service', (event, which) => {

})

ipcRenderer.on('start-service', (event, which) => {

})

ipcRenderer.on('stop-all-service', (event) => {

})

ipcRenderer.on('start-indexing-col', (event, which) => {

})

// import React from 'react'
// import ReactDOM from 'react-dom'
// import injectTapEventPlugin from 'react-tap-event-plugin'
// import ServiceDaemon from './serviceDaemon'
//
// if (process.env.NODE_ENV !== 'production') {
//   const {whyDidYouUpdate} = require('why-did-you-update')
//   whyDidYouUpdate(React)
// }
//
// window.React = React
//
// injectTapEventPlugin()
//
// ReactDOM.render(
//   <div>
//     <ServiceDaemon />
//   </div>,
//   document.getElementById('serviceDaemon')
// )