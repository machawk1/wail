import React, {Component, PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import autobind from 'autobind-decorator'
import S from 'string'
import isURL from 'validator/lib/isURL'
import UrlStore from '../../../stores/urlStore'
import CrawlDispatcher from '../../../dispatchers/crawl-dispatcher'
import UrlDispatcher from '../../../dispatchers/url-dispatcher'
import shallowCompare from 'react-addons-shallow-compare'
import wailConstants from '../../../constants/wail-constants'
import styles from '../../styles/styles'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes
const dataSource = [
  'http://',
  'https://',
  'www.',
  '.com',
  '.org'
]

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}
let focusTime = null

export default class ArchiveUrl extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      url: UrlStore.getUrl().s,
      underlineStyle: styles.underlineStyle,
      forCol: defForCol
    }
  }

  componentWillMount () {
    console.log('archiveurl cwm')
    UrlStore.on('url-updated', this.getUrl)
    ViewWatcher.on('basicColList-selected', this.updateForCol)
  }

  componentWillUnmount () {
    console.log('archiveurl cwum')
    UrlStore.removeListener('url-updated', this.getUrl)
    ViewWatcher.removeListener('basicColList-selected', this.updateForCol)
  }

  @autobind
  updateForCol (forCol) {
    console.log('archive url got an for col update', forCol)
    this.setState({ forCol })
  }

  @autobind
  getUrl () {
    let maybeUpdate = UrlStore.getUrl()
    if (this.state.url !== maybeUpdate.s) {
      this.setState({ url: maybeUpdate.s })
    }
  }

  @autobind
  handleChange (e) {
    let val = e.target.value
    clearTimeout(focusTime)
    focusTime = setTimeout(() => {
      console.log('Timeout focus time', val)
      if (isURL(val)) {
        UrlDispatcher.dispatch({
          type: EventTypes.HAS_VAILD_URI,
          url: val
        })

      }
    }, 600)
    this.setState({ url: e.target.value })
  }

  @autobind
  focusLost (event) {
    // console.log('checking url for archiving', this.state.url, event.target.value)
    clearTimeout(focusTime)
    if (isURL(event.target.value)) {
      console.log('its valid')
      UrlDispatcher.dispatch({
        type: EventTypes.HAS_VAILD_URI,
        url: event.target.value
      })
    } else {
      if (S(event.target.value).isEmpty()) {
        UrlDispatcher.dispatch({
          type: EventTypes.EMPTY_URL
        })
      }
    }
  }

  @autobind
  onClickArchiveNow (event) {
    // console.log('archive now')
    CrawlDispatcher.dispatch({
      type: EventTypes.BUILD_CRAWL_JOB,
      from: From.BASIC_ARCHIVE_NOW,
      forCol: this.state.forCol
    })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <TextField
        floatingLabelText='URL'
        id='archive-url-input'
        value={this.state.url}
        onBlur={this.focusLost}
        onChange={this.handleChange}
        style={styles.urlInput}
      />
    )
  }
}
/*
 <div style={{ display: 'flex' }}>
 <TextField
 floatingLabelText='URL'
 underlineStyle={this.state.underlineStyle}
 id='archive-url-input'
 value={this.state.url.s}
 onBlur={this.focusLost}
 onChange={this.handleChange}
 style={styles.urlInput}
 />
 </div>
 */
