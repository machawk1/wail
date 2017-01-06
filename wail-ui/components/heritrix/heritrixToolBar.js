import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import JobScanIcon from 'material-ui/svg-icons/av/playlist-add-check'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'
import { rescanJobDir, launchWebUI } from '../../actions/heritrix'

const styles = {
  button: {
    margin: 12
  }
}

const dispatchToProps = dispatch => ({
  scanJobDir: bindActionCreators(rescanJobDir, dispatch)
})

const enhance = onlyUpdateForKeys(['scanJobDir'])

const HeritrixToolBar = enhance(({scanJobDir}) => (
  <Toolbar className='layoutFooter'>
    <ToolbarGroup firstChild>
      <RaisedButton
        icon={<JobScanIcon />}
        label='Rescan Job Directory'
        labelPosition='before'
        style={styles.button}
        onTouchTap={scanJobDir}
      />
    </ToolbarGroup>
    <ToolbarGroup lastChild>
      <RaisedButton
        icon={<OpenBrowserIcon />}
        label='Launch Web UI'
        labelPosition='before'
        style={styles.button}
        onTouchTap={launchWebUI}
      />
    </ToolbarGroup>
  </Toolbar>
))

export default connect(null, dispatchToProps)(HeritrixToolBar)
