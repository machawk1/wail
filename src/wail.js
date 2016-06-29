import React from 'react'
import {Router, hashHistory} from 'react-router'
import ReactDOM from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'
import {ipcRenderer} from "electron"
Promise.promisifyAll(fs)
import Routes from './componets/routes'
import settings from './settings/settings'
injectTapEventPlugin()

import {writeWaybackConf} from "./actions/wayback-actions"



ipcRenderer.send("start-index-indexing")
ipcRenderer.send("start-crawljob-monitoring")
ipcRenderer.send("start-service-monitoring")


console.log('sads sdas sdas')
console.log('sads sdas sdas')

writeWaybackConf()

// ipcRenderer.send("start-test","ping")
// ipcRenderer.on("pong",pong => console.log(pong))


//TODO: make editing a form for default then allow for advanced

const wail = document.getElementById('wail')


ReactDOM.render(
   <Router
      history={hashHistory}
      routes={Routes}
   />
   ,
   wail)


// window.React = React
