import React, {Component} from "react"
import TextField from "material-ui/TextField"
import autobind from 'autobind-decorator'
import {Row, Column} from "react-cellblock"
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'
import validator from 'validator'
import * as aua from '../../actions/archive-url-actions'
import styles from '../styles/styles'

export default class ArchiveUrl extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { uri: "", underlineStyle: styles.underlineStyle }
  }

  @autobind
  handleChange (e) {
    console.log('setState')
    console.log(e.target.value)
    let value = e.target.value
    let err = styles.underlineStyleError
    if (validator.isURL(value)) {
      err = styles.underlineStyle
    }
    this.setState({ uri: value, underlineStyle: err })
  }

  @autobind
  attemptMementoGet () {
    if (validator.isURL(this.state.uri)) {
      aua.getMementos(this.state.uri)
    }
  }

  @autobind
  focusLost (event) {
    console.log('checking uri for archiving', this.state.uri, event.target.value)
    if (validator.isURL(event.target.value)) {
      console.log("its valid")
      aua.urlUpdated(event.target.value)
    }
  }

  render () {
    return (
      <Row>
        <TextField
          floatingLabelText="URL"
          underlineStyle={this.state.underlineStyle}
          hintText="http://matkelly.com/wail"
          id="archive-url-input"
          value={this.state.uri}
          onBlur={this.focusLost}
          onChange={this.handleChange}
          style={styles.urlInput}
        />
        <RaisedButton
          label="Get Memento Count"
          labelPosition="before"
          onTouchTap={this.attemptMementoGet}
          icon={<Avatar src="icons/memento.ico" size={30}/>}
          style={styles.buttonMemento}
        />
      </Row>
    )
  }
}
