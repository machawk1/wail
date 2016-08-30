import React, { Component } from 'react'
import { shell, remote } from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import cp from 'child_process'
import autobind from 'autobind-decorator'
import S from 'string'
import {
  ToastContainer,
  ToastMessage
} from 'react-toastr'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const ToastMessageFactory = React.createFactory(ToastMessage.animation)

const settings = remote.getGlobal('settings')

export default class WayBackTab extends Component {
  constructor (props, context) {
    super(props, context)
    this.toastr = null
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
        let em = `There was an error in force indexing! ${stderr}`
        this.toastr.error(<p>
          {em}
        </p>)
        console.error(error)
      }
      console.log(stderr)
      console.log(stdout)
      this.toastr.success(<p>
        {stdout}
      </p>)
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
        <ToastContainer
          toastMessageFactory={ToastMessageFactory}
          ref={(c) => this.toastr = c}
          preventDuplicates
          newestOnTop
          className='toast-top-center'
        />
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
