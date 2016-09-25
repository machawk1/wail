import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Layout from './layout'
import '../../css/wail.css'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Layout />,
  document.getElementById('newCrawl'))
