import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import NewCrawlDialog from './newCrawlDialog'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <NewCrawlDialog />,
  document.getElementById("newCrawl"))