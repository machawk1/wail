import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import {remote} from 'electron'
import Divider from 'material-ui/Divider'
import wailConstants from '../../constants/wail-constants'
import UrlSeedDispatcher from './crawlUrlsDispatcher'
import CrawlUrlItem from './crawlUrlItem'
import {ListItem} from 'material-ui/List'
import _ from 'lodash'

const EventTypes = wailConstants.EventTypes

class CrawlUrlsStore_ extends EventEmitter {

  constructor () {
    super()
    this.forCol = wailConstants.Default_Collection
    this.cols = window.__args__ // this is the collection names
    this.urls = []
    this.depth = 1
    this.editing = ''
  }

  /*
   NEW_CRAWL_ADD_URL: null,
   NEW_CRAWL_EDITED_URL: null,
   NEW_CRAWL_REMOVE_URL: null,
   */
  @autobind
  handleEvent (event) {
    console.log('CrawlUrlStore got an event', event)
    console.log(this.urls)
    switch (event.type) {
      case EventTypes.NEW_CRAWL_ADD_URL:
        let idx = this.urls.length
        this.urls.push({
          url: event.url,
          idx
        })
        this.emit('urlUpdate')
        console.log('Adding url', this.urls)
        break
      case EventTypes.NEW_CRAWL_EDITED_URL:
        console.log('CrawlUrlStore editing url before', this.urls)
        this.editing = event.url
        _.remove(this.urls, url => url.url === event.url && url.idx === event.idx)
        this.emit('urlEdit')
        console.log('CrawlUrlStore editing url after', this.urls)
        break
      case EventTypes.NEW_CRAWL_REMOVE_URL:
        console.log('CrawlUrlStore remove url before', this.urls)
        _.remove(this.urls, url => url.url === event.url && url.idx === event.idx)
        console.log('CrawlUrlStore remove url after', this.urls)
        this.emit('urlUpdate')
        break
      case EventTypes.NEW_CRAWL_ADD_DEPTH:
        console.log('CrawlUrlStore depth added before', this.depth)
        this.depth = event.depth
        console.log('CrawlUrlStore depth added after', this.depth)
        break
      case EventTypes.NEW_CRAWL_COL_SELECTED:
        this.forCol = event.forCol
        break
      default:
        console.log('wtf why are we here')
        break
    }
    console.log(this.urls)
  }

  @autobind
  getCrawlConfig () {
    if (this.urls.length === 0) {
      return null
    } else {
      var urls = this.urls.map(url => url.url)
      if (urls.length < 2) {
        urls = urls[ 0 ]
      }
      let depth = this.depth
      return { urls, depth, forCol: this.forCol }
    }
  }

  @autobind
  getUrls () {
    return this.urls.map(url => url.url)
  }

  @autobind
  getUrlToEdit () {
    let editMe = this.editing
    this.editing = ''
    return editMe
  }

  @autobind
  getCrawlUrlItems () {
    console.log('CrawlUrlStore getCrawlUrlItems')
    let len = this.urls.length
    let items = []
    if (len > 0) {
      for (let i = 0; i < len; ++i) {
        let url = this.urls[ i ]
        console.log(url)
        items.push(
          <CrawlUrlItem
            idx={url.idx}
            id={url.idx}
            num={url.idx}
            key={`${url.url}${url.idx}`}
            url={url.url}
          />)
        if (i + 1 !== len) {
          items.push(<Divider key={`Divider${url.url}${url.idx}`}/>)
        }
      }
    } else {
      items.push(<ListItem key='noSeeds' primaryText='No Seed Urls'/>)
    }

    console.log('CrawlUrlStore getCrawlUrlItems', items)
    return items
  }

}

const CrawlUrlsStore = new CrawlUrlsStore_()

window.CUrlsStore = CrawlUrlsStore

UrlSeedDispatcher.register(CrawlUrlsStore.handleEvent)
export default CrawlUrlsStore
