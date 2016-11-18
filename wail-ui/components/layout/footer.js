import React, {Component} from 'react'
import Notifications from '../informational/notifications'
import StatusDialog from '../informational/statusDialog'
import NewCollection from '../wayback/util/newCollection'
import EditMetadata from '../wayback/util/editMetaData'

export default class Footer extends Component {
  render () {
    return (
      <div style={{width: '0', height: '0'}}>
        <Notifications />
        <StatusDialog />
        <NewCollection />
        <EditMetadata />
      </div>
    )
  }
}
