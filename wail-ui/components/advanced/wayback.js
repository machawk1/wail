import React, { Component } from 'react'
import { shell, remote } from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import GMessageDispatcher from '../../dispatchers/globalMessageDispatcher'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import cp from 'child_process'
import autobind from 'autobind-decorator'
import S from 'string'
import wailConstants from '../../constants/wail-constants'

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class WayBackTab extends Component {
  constructor (props, context) {
    super(props, context)
  }
  @autobind
  forIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col: 'Wail' }), opts, (error, stdout, stderr) => {
      if (error) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `There was an error in force indexing! ${stderr}`
        })
        console.error(error)
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: stdout
        })
      }
      console.log(stderr)
      console.log(stdout)
    })
  }

  render () {
    return (
      <div>
        <Toolbar style={{ marginTop: '50px', backgroundColor: 'transparent' }}>
          <ToolbarGroup firstChild>
            <RaisedButton
              label='View in Browser'
              labelPosition='before'
              icon={<OpenBrowserIcon />}
              onMouseDown={() => shell.openExternal(settings.get('pywb.url'))}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <RaisedButton
              label='Force Reindexing'
              labelPosition='before'
              onMouseDown={this.forIndex}
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <RaisedButton
              icon={<FolderOpen />}
              label='View Archives'
              labelPosition='before'
              onMouseDown={() => shell.openItem(settings.get('collections.dir'))}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
    )
  }
}
/*
 <ToolbarGroup lastChild={true}>
 <RaisedButton
 label='Edit Configuration'
 labelPosition='before'
 icon={<EditIcon/>}
 onMouseDown={() => shell.openItem(settings.get('wayBackConf'))}
 />
 </ToolbarGroup>
 */
