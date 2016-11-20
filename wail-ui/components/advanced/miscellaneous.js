import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import RaisedButton from 'material-ui/FlatButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import { Card, CardActions, CardHeader, CardMedia } from 'material-ui/Card'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import CheckUpdateIcon from 'material-ui/svg-icons/action/open-in-browser'
import SettingIcon from 'material-ui/svg-icons/action/settings-applications'
import { remote, ipcRenderer as ipc } from 'electron'
import EventLog from './eventLog'
import { openUrlInBrowser, openFSLocation } from '../../actions/util-actions'

const settings = remote.getGlobal('settings')

export default class Misc extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      expanded: false
    }
  }

  handleExpandChange (expanded) {
    this.setState({ expanded: expanded })
  }

  handleToggle (event, toggle) {
    this.setState({ expanded: toggle })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <div style={{ width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'scroll' }}>
          <div className='generalTab'>
            <Card>
              <CardHeader
                title='Event Log'
                subtitle='View Last 100 Events'
                actAsExpander
                showExpandableButton
              />
              <CardMedia
                expandable
              >
                <EventLog />
              </CardMedia>
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
                    label='View Collections'
                    labelPosition='before'
                    onMouseDown={() => {
                      openFSLocation(settings.get('warcs'))
                    }}
                  />
                </ToolbarGroup>
                <ToolbarGroup>
                  <RaisedButton
                    label='Twitter'
                    labelPosition='before'
                    onMouseDown={() => {
                      ipc.send('sign-in-twitter')
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
            </Card>
          </div>
      </div>
    )
  }
}
