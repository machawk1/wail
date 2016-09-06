import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {Router, hashHistory, Route, IndexRoute} from 'react-router'
import Explorer from './explorer'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Explorer />,
  document.getElementById('explorer'))

