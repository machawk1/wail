import React, {Component} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import Notifications from '../informational/notifications'
import StatusDialog from '../informational/statusDialog'
import BottomNav from './bottomNav'

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
