import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Grid, Row } from 'react-cellblock'
import Layout from './layout'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import $ from 'cheerio'

// let {Menu} = remote

// const cmen = require('electron-editor-context-menu')()

const kids = (
  <Grid gutterWidth={20} flexable={true} columnWidth={100}>
    <Row>
      <CrawlUrlList />
    </Row>
    <EnterCrawlUrls />
    <CrawlDepth />
  </Grid>
)

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Layout children={kids}/>,
  document.getElementById('newCrawl'))
