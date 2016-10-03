import React, {Component} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import SettingIcon from 'material-ui/svg-icons/action/settings-applications'
import {ipcRenderer} from 'electron'

export default class BottomNav extends Component {

  render () {
    return (
      <Toolbar>
        <ToolbarGroup lastChild>
          <RaisedButton
            icon={<SettingIcon />}
            label='Settings'
            labelPosition='before'
            onMouseDown={() => ipcRenderer.send('open-settings-window', 'hi')}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
