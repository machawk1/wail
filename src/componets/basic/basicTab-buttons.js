import React, { Component } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'
import autobind from 'autobind-decorator'
import { Row } from 'react-cellblock'
import ViewArchiveIcon from 'material-ui/svg-icons/image/remove-red-eye'
import CheckArchiveStatIcon from 'material-ui/svg-icons/action/schedule'
import UrlDispatcher from '../../dispatchers/url-dispatcher'
import wailConstants from '../../constants/wail-constants'
import SettingIcon from 'material-ui/svg-icons/action/settings-applications'
import { ipcRenderer } from 'electron'
import styles from '../styles/styles'

const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {

  @autobind
  onClickCheckArchive (event) {
    // console.log('check archive')
    UrlDispatcher.dispatch({
      type: EventTypes.CHECK_URI_IN_ARCHIVE
    })
  }

  @autobind
  onClickViewArchive (event) {
    // console.log('view archive')
    UrlDispatcher.dispatch({
      type: EventTypes.VIEW_ARCHIVED_URI
    })
  }

  render () {
    return (
        <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton
                icon={<CheckArchiveStatIcon />}
                label='Check Archived Status'
                labelPosition='before'
                onMouseDown={this.onClickCheckArchive}
              />
            </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <RaisedButton
              icon={<ViewArchiveIcon />}
              label='View Archive'
              labelPosition='before'
              onMouseDown={this.onClickViewArchive}
            />
          </ToolbarGroup>
        </Toolbar>
    )
  }
}
