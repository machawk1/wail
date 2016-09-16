import React, { Component } from 'react'
import styles from '../../components/styles/styles'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import {Grid,Row,Col} from 'react-flexbox-grid'

export default class NewCrawlDialog extends Component {
  render () {
    return (
      <Grid fluid>
        <Row>
          <Col xs>
            <CrawlUrlList />
            </Col>
          <Col xs>
            <CrawlDepth />
            <div style={{ height: 75 }} />
            <EnterCrawlUrls />
            </Col>
          </Row>
      </Grid>
    )
  }
}
