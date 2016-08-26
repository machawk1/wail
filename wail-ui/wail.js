import 'babel-polyfill'
import React from 'react'
import { Router, hashHistory } from 'react-router'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import Promise from 'bluebird'
import { ipcRenderer, remote } from 'electron'
import Routes from './routes'
import { writeWaybackConf } from './actions/wayback-actions'
import RequestStore from './stores/requestStore'
require('./css/toaster.css')
require('./css/animate.css')
// require('pretty-error').start()

ipcRenderer.on('rewrite-wayback-config', (event, payload) => {
  console.log('wail got rewrite-wayback-config')
  writeWaybackConf()
})

Promise.promisifyAll(fs)

window.React = React



//  ensure out RequestStore is alive and kicking

window.ReqStore = RequestStore

injectTapEventPlugin()

ipcRenderer.send('start-index-indexing')
ipcRenderer.send('start-crawljob-monitoring')
ipcRenderer.send('start-service-monitoring')

writeWaybackConf()

const wail = document.getElementById('wail')

ReactDOM.render(
  <Router
    history={hashHistory}
    routes={Routes}
  />,
  wail)

