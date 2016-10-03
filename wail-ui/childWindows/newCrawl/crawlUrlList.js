import React, {Component} from 'react'
import autobind from 'autobind-decorator'
import {List, ListItem} from 'material-ui/List'
import styles from '../../components/styles/styles'
import CrawlUrlsStore from './crawlUrlsStore'

export default class UrlList extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      urls: [ <ListItem key='noSeeds' primaryText='No Seed Urls' /> ]
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
      <List style={styles.newCrawlList} children={this.state.urls} />
    )
  }
}
