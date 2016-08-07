import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import { Row, Column } from 'react-cellblock'
import styles from '../../componets/styles/styles'
import CrawlUrlsDispatcher from './crawlUrlsDispatcher'
import wailConstants from '../../constants/wail-constants'

const EventTypes = wailConstants.EventTypes
const items = [];
for (let i = 1; i <= 10; i++) {
  items.push(<MenuItem value={i} key={i} primaryText={`${i}`}/>)
}

export default class CrawlDepth extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      value: 1
    }
  }

  @autobind
  handleChange (event, index, value) {
    this.setState({ value })
    CrawlUrlsDispatcher.dispatch({
      type: EventTypes.NEW_CRAWL_ADD_DEPTH,
      depth: parseInt(value)
    })
  }

  render () {
    return (
      <SelectField
        autoWidth={true}
        maxHeight={200}
        style={styles.newCrawlDepth}
        value={this.state.value}
        onChange={this.handleChange}
        children={items}
        floatingLabelText="Crawl Depth"
      />
    )
  }
}
