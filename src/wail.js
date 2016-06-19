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

import logger from './logger'
Promise.promisifyAll(fs)
import Routes from './js/componets/routes'



injectTapEventPlugin()
console.log(module.exports)
const wail = document.getElementById('wail')


ReactDOM.render(
   <Router
      history={hashHistory}
      routes={Routes}
   />
   ,
   wail)


// window.React = React
