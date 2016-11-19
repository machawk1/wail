import 'babel-polyfill'
import 'react-flex/index.css'
import './css/wail.css'
import React from 'react'
import {render} from 'react-dom'
import {syncHistoryWithStore} from 'react-router-redux'
import {hashHistory} from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fs from 'fs-extra'
import Promise from 'bluebird'
import {remote} from 'electron'
import bunyan from 'bunyan'
import Wail from './containers/wail'
import wailConstants from './constants/wail-constants'
import configureStore from './stores/configureStore'
import createDetectElementResize from './vendor/detectElementResize'

Promise.promisifyAll(fs)

global.resizer = createDetectElementResize()

window.React = React

window.lastWaybackPath = wailConstants.Default_Collection

injectTapEventPlugin()

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

// process.on('uncaughtException', (err) => {
//   console.error(err)
//   window.logger.error(err)
// })

const store = configureStore()
// const history = syncHistoryWithStore(hashHistory, store, {
//   selectLocationState (state) {
//     console.log('select location state', state.get('routing'))
//     return  state.get('routing') ? state.get('routing').toJS() : {}
//   }
// })
render(<Wail store={store} history={hashHistory}/>, document.getElementById('wail'))

