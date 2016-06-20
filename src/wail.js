import React from 'react'
import {Router, hashHistory} from 'react-router'
import ReactDOM from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
import path from 'path'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'

Promise.promisifyAll(fs)
import Routes from './componets/routes'

injectTapEventPlugin()

import {ipcRenderer} from "electron"

ipcRenderer.send("start-test","ping")
ipcRenderer.on("pong",pong => console.log(pong))
ipcRenderer.on("test-status-update", update  => console.log(update))


const wail = document.getElementById('wail')


ReactDOM.render(
   <Router
      history={hashHistory}
      routes={Routes}
   />
   ,
   wail)


// window.React = React
