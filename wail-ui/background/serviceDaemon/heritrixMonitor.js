import React, { Component, PropTypes } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import {remote,ipcRender} from 'electron'

export default class HeritrixMonitor extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
  }
}