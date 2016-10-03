import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import TextField from 'material-ui/TextField'
import AddUrlIcon from 'material-ui/svg-icons/content/add'
import {Row, Column} from 'react-cellblock'
import S from 'string'
import isURL from 'validator/lib/isURL'
import CrawlUrlsDispatcher from './crawlUrlsDispatcher'
import styles from '../../components/styles/styles'
import wailConstants from '../../constants/wail-constants'
import CrawlUrlsStore from './crawlUrlsStore'

const style = {
  marginRight: 20
}
const EventTypes = wailConstants.EventTypes

export default class EnterCrawlUrls extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { url: '', underlineStyle: styles.underlineStyle }
  }

  componentWillMount () {
    CrawlUrlsStore.on('urlEdit', this.getUrlToEdit)
  }

  componentWillUnmount () {
    CrawlUrlsStore.removeListener('urlEdit', this.getUrlToEdit)
  }

  @autobind
  getUrlToEdit () {
    this.setState({ url: CrawlUrlsStore.getUrlToEdit() })
  }

  @autobind
  checkKeyCode (event) {
    if (event.keyCode === 13) {
      let url = event.target.value
      let underlineStyle = styles.underlineStyleError
      if (isURL(url) || S(url).isEmpty()) {
        underlineStyle = styles.underlineStyle
      }
      if (isURL(url)) {
        CrawlUrlsDispatcher.dispatch({
          type: EventTypes.NEW_CRAWL_ADD_URL,
          url: url
        })
        url = ''
      }
      this.setState({ url, underlineStyle })
    }
  }

  @autobind
  handleChange (event) {
    let url = event.target.value
    let underlineStyle = styles.underlineStyleError
    if (isURL(url) || S(url).isEmpty()) {
      underlineStyle = styles.underlineStyle
    }
    this.setState({ url, underlineStyle })
  }

  @autobind
  addUrl (event) {
    console.log('Adding url from button', this.state.url)
    let url = this.state.url
    if (isURL(url)) {
      CrawlUrlsDispatcher.dispatch({
        type: EventTypes.NEW_CRAWL_ADD_URL,
        url
      })
      this.setState({ url: '', underlineStyle: styles.underlineStyle })
    }
  }

  render () {
    return (
      <div style={{marginTop: '80px'}}>
        <TextField
          floatingLabelText='Enter URL to crawl'
          id='crawl-url-input'
          type='url'
          style={styles.newCrawlUrlInput}
          value={this.state.url}
          onKeyDown={this.checkKeyCode}
          onChange={this.handleChange}
        />
        <FloatingActionButton
          mini
          onMouseDown={this.addUrl}
        >
          <AddUrlIcon />
        </FloatingActionButton>
      </div>
    )
  }
}
/*
 <RaisedButton
 icon={<AddUrlIcon />}
 label="Add Url"
 labelPosition="before"
 style={styles.ncAddUrlButton}
 onMouseDown={this.addUrl}
 />
 */
