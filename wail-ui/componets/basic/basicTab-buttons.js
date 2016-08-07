import React, { Component } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'
import autobind from 'autobind-decorator'
import CheckArchiveStatIcon from 'material-ui/svg-icons/action/schedule'
import UrlDispatcher from '../../dispatchers/url-dispatcher'
import wailConstants from '../../constants/wail-constants'
import SettingIcon from 'material-ui/svg-icons/action/settings-applications'
import { ipcRenderer } from 'electron'

const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {

  @autobind
  onClickCheckArchive (event) {
    UrlDispatcher.dispatch({
      type: EventTypes.CHECK_URI_IN_ARCHIVE
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
            icon={<SettingIcon />}
            label="Settings"
            labelPosition="before"
            onMouseDown={() => ipcRenderer.send('open-settings-window', "hi") }
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
