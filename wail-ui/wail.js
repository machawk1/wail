import 'babel-polyfill'
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
import './css/wail.css'


Promise.promisifyAll(fs)


//  ensure out RequestStore is alive and kicking
window.React = React
window.colStore = ColStore
window.ReqStore = RequestStore

injectTapEventPlugin()

// ipcRenderer.send('get-all-collections')
// ipcRenderer.send('get-all-runs')

const wail = document.getElementById('wail')

render(
  <Router
    history={hashHistory}
    routes={Routes}
  />,
  wail)

