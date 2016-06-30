import React from 'react'
import { Router, hashHistory } from 'react-router'
import ReactDOM from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'
import { ipcRenderer } from "electron"
Promise.promisifyAll(fs)
import Routes from './componets/routes'
import { writeWaybackConf } from "./actions/wayback-actions"

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
  />
  ,
  wail)

