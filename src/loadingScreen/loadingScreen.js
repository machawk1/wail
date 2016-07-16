import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import LoadingProgress from './components/loadingProgress'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <LoadingProgress />,
  document.getElementById('loading'))
