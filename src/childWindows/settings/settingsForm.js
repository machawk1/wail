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
import getMuiTheme from 'material-ui/styles/getMuiTheme'
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
  }

  enableButton() {
    this.setState({
      canSubmit: true,
    });
  }

  disableButton() {
    this.setState({
      canSubmit: false,
    });
  }

  submitForm(data) {
    alert(JSON.stringify(data, null, 4));
  }

  notifyFormError(data) {
    console.error('Form error:', data);
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }
}
