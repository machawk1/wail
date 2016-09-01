import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import ServiceDaemon from './serviceDaemon'

if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <div>
    <ServiceDaemon />
  </div>,
  document.getElementById('serviceDaemon')
)