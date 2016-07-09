import React from 'react'
import Formsy from 'formsy-react'
import {
  FormsyCheckbox,
  FormsyDate,
  FormsyRadio,
  FormsyRadioGroup,
  FormsySelect,
  FormsyText, FormsyTime, FormsyToggle
} from 'formsy-material-ui/lib'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { ipcRenderer, remote } from 'electron'
import autobind from 'autobind-decorator'
