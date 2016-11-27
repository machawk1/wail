import React, {Component} from 'react'
import Notifications from '../informational/notifications'
import StatusDialog from '../dialogs/statusDialog'
import NewCollection from '../dialogs/newCollection'
import EditMetadata from '../dialogs/editMetaData'

export default class Footer extends Component {
  render () {
    return (
      <div style={{width: '0', height: '0'}}>
        <Notifications />
        <NewCollection />
        <EditMetadata />
      </div>
    )
  }
}
