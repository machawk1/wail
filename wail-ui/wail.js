import 'babel-polyfill'
import 'react-flex/index.css'
import './css/wail.css'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import routes from './routes'
import {Router, hashHistory} from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import Promise from 'bluebird'
import {ipcRenderer, remote} from 'electron'
import bunyan from 'bunyan'
import wailConstants from './constants/wail-constants'
import configureStore from './stores/configureStore'

Promise.promisifyAll(fs)

//  ensure out RequestStore is alive and kicking
window.React = React

window.lastWaybackPath = wailConstants.Default_Collection

injectTapEventPlugin()

// ipcRenderer.send('get-all-collections')210
// ipcRenderer.send('get-all-runs')

const wail = document.getElementById('wail')
window.eventLog = new bunyan.RingBuffer({ limit: 100 })

window.logger = bunyan.createLogger({
  name: 'wail-ui',
  streams: [
    {
      level: 'info',
      path: remote.getGlobal('wailUILogp')
    },
    {
      level: 'trace',
      type: 'raw',    // use 'raw' to get raw log record objects
      stream: window.eventLog
    }
  ]
})

process.on('uncaughtException', (err) => {
  window.logger.error(err)
})
const store = configureStore()
render(
  <Provider store={store}>
    <Router history={hashHistory} routes={routes}/>
  </Provider>,
  document.getElementById('wail'))

