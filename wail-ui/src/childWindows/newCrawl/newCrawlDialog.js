import React, { Component } from 'react'
import styles from '../../componets/styles/styles'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'

export default class NewCrawlDialog extends Component {
  render () {
    return (
      <div style={styles.newCrawlBody}>
        <CrawlUrlList />
        <div style={styles.newCrawlColRow}>
          <CrawlDepth />
          <div style={{ height: 75 }}/>
          <EnterCrawlUrls />
        </div>
      </div>
    )
  }
}
