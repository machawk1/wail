import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Layout from './layout'
import NewCrawlD from './newCrawlDialog'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Layout children={<NewCrawlD />} />,
  document.getElementById('newCrawl'))
