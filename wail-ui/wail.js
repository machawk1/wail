import 'babel-polyfill'
import 'react-flex/index.css'
import './css/wail.css'
import Rx from 'rxjs/Rx'
import React from 'react'
import { render } from 'react-dom'
import { hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { remote } from 'electron'
import bunyan from 'bunyan'
import Wail from './containers/wail'
import configureStore from './stores/configureStore'
import createDetectElementResize from './vendor/detectElementResize'
import TwitterClient from '../wail-twitter/twitterClient'
import RingBuffer from './util/ringBuffer'
import windowCloseHandler from './windowCloseHandler'

if (process.env.NODE_ENV === 'development') {
  window.Perf = require('react-addons-perf')
}


global.notifications$ = new Rx.BehaviorSubject({type: 'initial'})
global.resizer = createDetectElementResize()
global.twitterClient = new TwitterClient()

injectTapEventPlugin()

const wail = document.getElementById('wail')
window.eventLog = new RingBuffer()

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
      stream: window.eventLog
    }
  ]
})

// process.on('uncaughtException', (err) => {
//   console.error(err)
//   window.logger.error(err)
// })

const store = configureStore()


if (process.env.WAILTEST) {
  const setupTestHook = require('./setupTestHook')
  setupTestHook(store, hashHistory)
}

window.onbeforeunload = windowCloseHandler(store)

render(<Wail store={store} history={hashHistory}/>, document.getElementById('wail'))

