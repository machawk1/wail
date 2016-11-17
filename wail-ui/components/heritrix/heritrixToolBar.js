import React, {Component} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import shallowCompare from 'react-addons-shallow-compare'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import JobScanIcon from 'material-ui/svg-icons/av/playlist-add-check'
import {remote} from 'electron'
import {rescanJobDir} from '../../actions/heritrix-actions'
import {openUrlInBrowser} from '../../actions/util-actions'
const styles = {
  button: {
    margin: 12
  }
}

const settings = remote.getGlobal('settings')

export default class HeritrixToolBar extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  onClickLaunchWebUI () {
    openUrlInBrowser(settings.get('heritrix.web_ui'))
  }

  render () {
    return (
      <Toolbar className='layoutFooter'>
        <ToolbarGroup firstChild>
          <RaisedButton
            icon={<JobScanIcon />}
            label='Rescan Job Directory'
            labelPosition='before'
            style={styles.button}
            onMouseDown={rescanJobDir}
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <RaisedButton
            icon={<OpenBrowserIcon />}
            label='Launch Web UI'
            labelPosition='before'
            style={styles.button}
            onMouseDown={::this.onClickLaunchWebUI}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
