import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import { remote, ipcRenderer } from 'electron'
import {ListItem} from 'material-ui/List'
import SBackupRestore from 'material-ui/svg-icons/action/settings-backup-restore'
import FlatButton from 'material-ui/RaisedButton'

const { dialog } = remote

export default class SettingHardReset extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
  }

  @autobind
  onClick(event) {
    dialog.showMessageBox(remote.getCurrentWindow(),{
      type: 'question',
      title: 'Are you sure?',
      message: 'You will lose all your configurations and Wail will have to be reconfigured',
      buttons: [ 'Im Sure', 'Cancel' ],
      cancelId: 666
    }, (r) => {
      if (r === 1) {
        ipcRenderer.send(this.props.channel)
      }
    })

  }

  render () {
    return (
      <ListItem
        key={`ipccb-li-${this.props.name}`}
        disabled={true}
        primaryText={
          <FlatButton
            label={this.props.name}
            primary={true}
            labelPosition='before'
            onTouchTap={this.onClick}
            icon={<SBackupRestore />}
          />
        }
      />
    )
  }
}
