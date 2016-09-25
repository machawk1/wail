import React, { Component, PropTypes } from 'react'
import BeamMeUpScotty from 'drag-drop'
import { ipcRenderer as ipc } from 'electron'
import * as notify from '../../../actions/notification-actions'
import path from 'path'
import { joinStrings } from 'joinable'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import ContentAdd from 'material-ui/svg-icons/content/add'

export default class WarcToCollection extends Component {
  static propTypes = {
    currCollection: PropTypes.string,
  }



  render () {
    return (
      <FloatingActionButton mini onTouchTap={()=> console.log('touchtap')}>
        <ContentAdd />
      </FloatingActionButton>
    )
  }

}
