import React, {Component} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import CheckUpdateIcon from 'material-ui/svg-icons/action/open-in-browser'
import SettingIcon from 'material-ui/svg-icons/action/settings-applications'
import {remote, ipcRenderer} from 'electron'
import EventLog from './eventLog'
import {openUrlInBrowser, openFSLocation} from '../../actions/util-actions'

const settings = remote.getGlobal('settings')

export default class Misc extends Component {
  render () {
    return (
      <div>
        <EventLog />
        <Toolbar style={{ marginTop: '50px', backgroundColor: 'transparent' }}>
          <ToolbarGroup firstChild>
            <RaisedButton
              icon={<SettingIcon />}
              label='Settings'
              labelPosition='before'
              onMouseDown={() => ipcRenderer.send('open-settings-window', 'hi')}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <RaisedButton
              icon={<FolderOpen />}
              label='View Archives'
              labelPosition='before'
              onMouseDown={() => {
                openFSLocation(settings.get('warcs'))
              }}
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <RaisedButton
              icon={<CheckUpdateIcon />}
              label='Check For Updates'
              labelPosition='before'
              onMouseDown={() => openUrlInBrowser('https://github.com/N0taN3rd/wail/releases')}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
    )
  }
}
