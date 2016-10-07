import React, {Component} from 'react'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import SellectCollection from './selectCollection'
import {Grid, Row, Col} from 'react-flexbox-grid'

export default class NewCrawlDialog extends Component {

  render () {
    console.log(window.__args__)
    return (
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
    )
  }
}

