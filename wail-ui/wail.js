import 'babel-polyfill'
import 'react-flex/index.css'
import 'react-joyride/lib/react-joyride-compiled.css'
import './css/wail.css'
import {BehaviorSubject} from 'rxjs'
import React from 'react'
import { render } from 'react-dom'
import createHashHist from 'history/createHashHistory'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { remote } from 'electron'
import bunyan from 'bunyan'
import Wail from './containers/wail'
import configureStore from './stores/configureStore'
import createDetectElementResize from './vendor/detectElementResize'
import TwitterClient from '../wail-twitter/twitterClient'
import RingBuffer from './util/ringBuffer'
import windowCloseHandler from './windowCloseHandler'
injectTapEventPlugin()

const store = configureStore()
const hashHistory = createHashHist()

if (process.env.NODE_ENV === 'development') {
  window.Perf = require('react-addons-perf')
  window.__history = hashHistory
  hashHistory.listen((location, action) => {
    console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`)
    console.log(`The last navigation action was ${action}`)
  })
}

if (process.env.WAILTEST) {
  const setupTestHook = require('./setupTestHook')
  setupTestHook(store, hashHistory)
}

global.notifications$ = new BehaviorSubject({type: 'initial'})
global.resizer = createDetectElementResize()
global.twitterClient = new TwitterClient()

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
window.onbeforeunload = windowCloseHandler(store)

render(<Wail store={store} history={hashHistory} />, document.getElementById('wail'))
