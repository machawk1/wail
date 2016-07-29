import React, { Component } from 'react'
import { shell, remote } from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'

const settings = remote.getGlobal('settings')

export default class WayBackTab extends Component {
  render () {
    return (
      <Toolbar style={{marginTop: '50px',backgroundColor:'transparent'}}>
        <ToolbarGroup>
          <RaisedButton
            label='View in Browser'
            labelPosition='before'
            icon={<OpenBrowserIcon />}
            onMouseDown={() => shell.openExternal(settings.get('wayback.uri_wayback'))}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <RaisedButton
            label='Edit Configuration'
            labelPosition='before'
            icon={<EditIcon/>}
            onMouseDown={() => shell.openItem(settings.get('wayBackConf'))}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
