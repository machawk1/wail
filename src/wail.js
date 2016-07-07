import 'babel-polyfill'
import React from 'react'
import { Router, hashHistory } from 'react-router'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
import fs from 'fs-extra'
import Promise from 'bluebird'
import { ipcRenderer } from 'electron'
import Routes from './routes'
import { writeWaybackConf } from './actions/wayback-actions'
gracefulFs.gracefulify(fsreal)
Promise.promisifyAll(fs)

/*
 logger.transports.file.format = '[{m}:{d}:{y} {h}:{i}:{s}] [{level}] {text}'
 logger.transports.file.maxSize = 5 * 1024 * 1024
 logger.transports.file.file = logPath
 logger.transports.file.streamConfig = {flags: 'a'}
 */
window.React = React

injectTapEventPlugin()

ipcRenderer.send("start-index-indexing")
ipcRenderer.send("start-crawljob-monitoring")
ipcRenderer.send("start-service-monitoring")

writeWaybackConf()

const wail = document.getElementById('wail')

ReactDOM.render(
  <Router
    history={hashHistory}
    routes={Routes}
  />,
  wail)
