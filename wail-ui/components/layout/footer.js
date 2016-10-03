import React, {Component} from 'react'
import Notifications from '../informational/notifications'
import StatusDialog from '../informational/statusDialog'
import NewCollection from '../wayback/util/newCollection'

export default class Footer extends Component {
  render () {
    return (
      <div>
        <Notifications />
        <StatusDialog />
        <NewCollection />
      </div>
    )
  }
}
