import React, {Component} from 'react'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import SellectCollection from './selectCollection'


export default class NewCrawlDialog extends Component {

  render () {
    console.log(window.__args__)
    return (
      <div>
        <CrawlUrlList />
        <CrawlDepth />
        <SellectCollection />
        <EnterCrawlUrls />
      </div>
    )
  }
}

