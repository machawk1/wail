import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Loading from './loading'
require('../../css/wail.css')

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Loading />,
  document.getElementById('loading'))

