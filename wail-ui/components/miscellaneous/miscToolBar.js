import React, { Component } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/FlatButton'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import CheckUpdateIcon from 'material-ui/svg-icons/action/open-in-browser'
import { remote } from 'electron'
import { openUrlInBrowser, openFSLocation } from '../../actions/util-actions'

const settings = remote.getGlobal('settings')

const MiscToolBar = () => (
  <Toolbar style={{marginTop: '50px', backgroundColor: 'transparent'}}>
    <ToolbarGroup firstChild>
      <RaisedButton
        icon={<FolderOpen />}
        label='View Collections'
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
)

export default MiscToolBar
