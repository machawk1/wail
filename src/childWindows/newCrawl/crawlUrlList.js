import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import autobind from 'autobind-decorator'
import { List, ListItem } from 'material-ui/List'
import CrawlUrlsStore from './crawlUrlsStore'
import cheerio from 'cheerio'
const lstyle = {
  height: 150, overflow: 'hidden',
  overflowY: 'scroll'
}

// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
//   // console.log(e.toElement)
//  // e.toE.innerHTML = "!!!!!"
//   // console.log(e)
//   // // console.log(document.getElementById('newCrawl'))
//   // let {target} = e
//   // ReactDOM
//
// }, false)

export default class UrlList extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      urls: [ <ListItem key="noSeeds" primaryText="No Seed Urls"/> ]
    }
  }

  componentWillMount () {
    CrawlUrlsStore.on('urlUpdate', this.getUrls)
    CrawlUrlsStore.on('urlEdit', this.getUrls)
  }

  componentWillUnmount () {
    CrawlUrlsStore.removeListener('urlUpdate', this.getUrls)
    CrawlUrlsStore.removeListener('urlEdit', this.getUrls)
  }

  @autobind
  getUrls () {
    let it = CrawlUrlsStore.getCrawlUrlItems()
    // console.log('UrlList getUrls',it)
    this.setState({ urls: it })
  }

  render () {
    return (
      <List style={lstyle} children={this.state.urls}/>
    )
  }
}
