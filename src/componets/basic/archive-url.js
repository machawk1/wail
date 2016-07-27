import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import autobind from 'autobind-decorator'
import { Row, Column } from 'react-cellblock'
import RaisedButton from 'material-ui/RaisedButton'
import S from 'string'
import isURL from 'validator/lib/isURL'
import UrlStore from '../../stores/urlStore'
import * as aua from '../../actions/archive-url-actions'
import styles from '../styles/styles'

export default class ArchiveUrl extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { uri: UrlStore.getUrl(), underlineStyle: styles.underlineStyle }
  }

  @autobind
  handleChange (e) {
    let value = e.target.value
    let err = styles.underlineStyleError
    if (isURL(value) || S(value).isEmpty()) {
      err = styles.underlineStyle
    }
    this.setState({ uri: value, underlineStyle: err })
  }

  @autobind
  attemptMementoGet () {
    console.log(this.state.uri)
    if (isURL(this.state.uri)) {
      aua.getMementos(this.state.uri)
    } else {
      console.log('This is not a valid url', this.state.uri)
    }
  }

  @autobind
  focusLost (event) {
    // console.log('checking url for archiving', this.state.url, event.target.value)
    if (isURL(event.target.value)) {
      // console.log('its valid')
      aua.urlUpdated(event.target.value)
    } else {
      if (S(event.target.value).isEmpty()) {
        aua.emptyURL()
      }
    }
  }

  render () {
    return (
      <Row>
        <Column width="1/2">
          <TextField
            floatingLabelText='URL'
            underlineStyle={this.state.underlineStyle}
            hintText="http://matkelly.com/wail"
            id="archive-url-input"
            value={this.state.url}
            onBlur={this.focusLost}
            onChange={this.handleChange}
            style={styles.urlInput}
          />
        </Column>
        <Column width="1/2">
          <div style={styles.basicTapRightColPad}>
            <RaisedButton
              label='Get Memento Count'
              labelPosition='before'
              onTouchTap={this.attemptMementoGet}
              style={styles.buttonMemento}
            />
          </div>
        </Column>
      </Row>
    )
  }
}
