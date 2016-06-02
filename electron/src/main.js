import React from "react"
import ReactDOM from "react-dom"
import Wail from './js/componets/wail'
import injectTapEventPlugin from 'react-tap-event-plugin'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'
Promise.promisifyAll(fs)


injectTapEventPlugin()

const wail = document.getElementById('wail')



ReactDOM.render(<Wail />, wail)