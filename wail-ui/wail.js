import 'babel-polyfill'
import React from 'react'
import {hashHistory} from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from './containers/root'
import configureStore from './stores/redux/configureStore'
import {render} from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import Promise from 'bluebird'
import {ipcRenderer, remote} from 'electron'
import RequestStore from './stores/requestStore'
import ColStore from './stores/collectionStore'
import './css/wail.css'
import bunyan from 'bunyan'

Promise.promisifyAll(fs)

//  ensure out RequestStore is alive and kicking
window.React = React
window.colStore = ColStore
window.ReqStore = RequestStore

injectTapEventPlugin()

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

// ipcRenderer.send('get-all-collections')
// ipcRenderer.send('get-all-runs')

const wail = document.getElementById('wail')
const ringbuffer = window.eventLog = new bunyan.RingBuffer({ limit: 100 })

window.logger = bunyan.createLogger({
  name: 'wail-ui',
  streams: [
    {
      level: 'info',
      path: remote.getGlobal('wailUILogp')
    },
    {
      level: 'debug',
      type: 'raw',    // use 'raw' to get raw log record objects
      stream: ringbuffer
    }
  ]
})



process.on('uncaughtException', (err) => {
  window.logger.error(err)
})

render(<Root store={store} history={history} />, wail)

