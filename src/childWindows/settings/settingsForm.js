import React, { Component, PropTypes }  from 'react'
import Formsy from 'formsy-react'
import {
  FormsyCheckbox,
  FormsyDate,
  FormsyRadio,
  FormsyRadioGroup,
  FormsySelect,
  FormsyText, FormsyTime, FormsyToggle
} from 'formsy-material-ui/lib'
import Paper from 'material-ui/Paper'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import RaisedButton from 'material-ui/RaisedButton'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MenuItem from 'material-ui/MenuItem'
import { ipcRenderer, remote } from 'electron'
import autobind from 'autobind-decorator'

const baseTheme = getMuiTheme(lightBaseTheme)

export default class SettingsForm extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      muiTheme: baseTheme,
      canSubmit: false
    }

    this.styles = {
      paperStyle: {
        width: 300,
        margin: 'auto',
        padding: 20,
      },
      switchStyle: {
        marginBottom: 16,
      },
      submitStyle: {
        marginTop: 32,
      },
    }

    this.errorMessages = {
      wordsError: 'Please only use letters',
      numericError: 'Please provide a number',
      urlError: 'Please provide a valid URL',
    }
  }

  @autobind
  enableButton () {
    this.setState({
      canSubmit: true,
    })
  }

  @autobind
  disableButton () {
    this.setState({
      canSubmit: false,
    })
  }

  submitForm (data) {
    alert(JSON.stringify(data, null, 4))
  }

  notifyFormError (data) {
    console.error('Form error:', data)
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  render () {
    let { wordsError, numericError, urlError } = this.errorMessages
    return (
      <Paper style={this.styles.paperStyle}>
        <Formsy.Form
          onValid={this.enableButton}
          onInvalid={this.disableButton}
          onValidSubmit={this.submitForm}
          onInvalidSubmit={this.notifyFormError}
        >
          <FormsyText
            name="name"
            validations="isWords"
            validationError={wordsError}
            required
            hintText="What is your name?"
            floatingLabelText="Name"
          />
          <FormsyText
            name="age"
            validations="isNumeric"
            validationError={numericError}
            hintText="Are you a wrinkly?"
            floatingLabelText="Age (optional)"
          />
          <FormsyText
            name="url"
            validations="isUrl"
            validationError={urlError}
            required
            hintText="http://www.example.com"
            floatingLabelText="URL"
          />
          <FormsySelect
            name="frequency"
            required
            floatingLabelText="How often do you?"
            menuItems={this.selectFieldItems}
          >
            <MenuItem value={'never'} primaryText="Never"/>
            <MenuItem value={'nightly'} primaryText="Every Night"/>
            <MenuItem value={'weeknights'} primaryText="Weeknights"/>
          </FormsySelect>
          <FormsyDate
            name="date"
            required
            floatingLabelText="Date"
          />
          <FormsyTime
            name="time"
            required
            floatingLabelText="Time"
          />
          <FormsyCheckbox
            name="agree"
            label="Do you agree to disagree?"
            style={this.styles.switchStyle}
          />
          <FormsyToggle
            name="toggle"
            label="Toggle"
            style={this.styles.switchStyle}
          />
          <FormsyRadioGroup name="shipSpeed' defaultSelected='not_light">
            <FormsyRadio
              value="light"
              label="prepare for light speed"
              style={this.styles.switchStyle}
            />
            <FormsyRadio
              value="not_light"
              label="light speed too slow"
              style={this.styles.switchStyle}
            />
            <FormsyRadio
              value="ludicrous"
              label="go to ludicrous speed"
              style={this.styles.switchStyle}
              disabled={true}
            />
          </FormsyRadioGroup>
          <RaisedButton
            style={this.styles.submitStyle}
            type="submit"
            label="Submit"
            disabled={!this.state.canSubmit}
          />
        </Formsy.Form>
      </Paper>
    )
  }
}
