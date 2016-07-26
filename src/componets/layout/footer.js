import React, { Component } from 'react'
import Notifications from '../informational/notifications'
import StatusDialog from '../informational/statusDialog'

export default class Footer extends Component {
  render () {
    return (
      <div>
        <Notifications />
        <StatusDialog />
      </div>
    )
  }
}
