import React, {Component} from 'react'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import '../../css/flexing.css'
import SellectCollection from './selectCollection'
import {Grid, Row, Col} from 'react-flexbox-grid'

/*
 <Grid fluid>
 <Row>
 <Col xs>
 <CrawlUrlList />
 </Col>
 <Col xs>
 <Row top="xs">
 <Col xs>
 <CrawlDepth />
 </Col>
 <Col xs>
 <SellectCollection />
 </Col>
 </Row>
 <Row bottom="xs">
 <Col xs>
 <EnterCrawlUrls />
 </Col>
 </Row>
 </Col>
 </Row>
 </Grid>
 */

export default class NewCrawlDialog extends Component {
  render () {
    console.log(window.__args__)
    return (
     <div className="flex-cwise">
       <div className="flex-cwise lg-column size-x1">
          <div className="size-x1">
            <CrawlUrlList />
          </div>
         <div className="flex-rwise size-x1">
           <CrawlDepth />
           <SellectCollection />
           <EnterCrawlUrls />
         </div>
       </div>
     </div>
    )
  }
}

