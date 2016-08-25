import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import autobind from 'autobind-decorator'
import { Row, Column } from 'react-cellblock'
import RaisedButton from 'material-ui/RaisedButton'
import S from 'string'
import isURL from 'validator/lib/isURL'
import UrlStore from '../../stores/urlStore'
import * as aua from '../../actions/archive-url-actions'
import CrawlDispatcher from '../../dispatchers/crawl-dispatcher'
import ArchiveNowButton from 'material-ui/svg-icons/content/archive'
import wailConstants from '../../constants/wail-constants'
import styles from '../styles/styles'

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes

let focusTime = null



export default class ArchiveUrl extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { url: UrlStore.getUrl(), underlineStyle: styles.underlineStyle }
  }

  componentWillMount () {
    UrlStore.on('url-updated', this.getUrl)
  }

  componentWillUnmount () {
    UrlStore.removeListener('url-updated', this.getUrl)
  }

  @autobind
  getUrl () {
    let maybeUpdate = UrlStore.getUrl()
    if (this.state.url.s !== maybeUpdate.s) {
      this.setState({ url: this.state.url.setValue(maybeUpdate.s) })
    }
  }

  @autobind
  handleChange (e) {
    let val = e.target.value
    clearTimeout(focusTime)
    focusTime = setTimeout(() => {
      console.log('Timeout focus time')
      if (isURL(val)) {
        aua.urlUpdated(val)
      }
    }, 1500)
    let value = e.target.value
    let err = styles.underlineStyleError
    if (isURL(value) || S(value).isEmpty()) {
      err = styles.underlineStyle
    }
    this.setState({ url: this.state.url.setValue(value), underlineStyle: err })
  }

  @autobind
  focusLost (event) {
    // console.log('checking url for archiving', this.state.url, event.target.value)
    clearTimeout(focusTime)
    if (isURL(event.target.value)) {
      console.log('its valid')
      aua.urlUpdated(event.target.value)
    } else {
      if (S(event.target.value).isEmpty()) {
        aua.emptyURL()
      }
    }
  }

  @autobind
  onClickArchiveNow (event) {
    // console.log('archive now')
    CrawlDispatcher.dispatch({
      type: EventTypes.BUILD_CRAWL_JOB,
      from: From.BASIC_ARCHIVE_NOW
    })
  }

  render () {
    return (
      <div style={{ display: 'flex' }}>
        <TextField
          floatingLabelText="URL"
          underlineStyle={this.state.underlineStyle}
          id="archive-url-input"
          value={this.state.url.s}
          onBlur={this.focusLost}
          onChange={this.handleChange}
          style={styles.urlInput}
        />
      </div>
    )
  }
}
