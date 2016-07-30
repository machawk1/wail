import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {Grid, Row, Column} from 'react-cellblock'
import Layout from './layout'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'

// const kids = (
//   <Grid gutterWidth={20} flexable={true} columnWidth={100}>
//     <Row>
//       <div style={{ display: 'flex' }}>
//         <div style={{ flex: 1 }}>
//           <CrawlUrlList />
//         </div>
//         <CrawlDepth />
//       </div>
//     </Row>
//     <EnterCrawlUrls />
//   </Grid>
// )

const kids = (
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1 }}>
      <CrawlUrlList />
    </div>
      <CrawlDepth />
      <EnterCrawlUrls />
  </div>
)

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <Layout children={kids}/>,
  document.getElementById('newCrawl'))
