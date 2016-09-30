import 'babel-polyfill'
import './css/wail.css'
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import React from 'react'
import {Router, hashHistory} from 'react-router'
import {render} from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import Promise from 'bluebird'
import {ipcRenderer, remote} from 'electron'
import Routes from './routes'
import RequestStore from './stores/requestStore'
import ColStore from './stores/collectionStore'
import bunyan from 'bunyan'
import wailConstants from './constants/wail-constants'
Promise.promisifyAll(fs)


//  ensure out RequestStore is alive and kicking
window.React = React
window.colStore = ColStore
window.ReqStore = RequestStore

window.lastWaybackPath = wailConstants.Default_Collection

injectTapEventPlugin()

// ipcRenderer.send('get-all-collections')
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

render(
  <Router
    history={hashHistory}
    routes={Routes}
  />,
  wail)

