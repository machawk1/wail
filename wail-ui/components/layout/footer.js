import React, { Component } from 'react'
import { namedPure } from '../../util/recomposeHelpers'
import Notifications from '../informational/notifications'
import NewCollection from '../dialogs/newCollection'
import EditMetadata from '../dialogs/editMetaData'

const enhance = namedPure('Footer')
const Footer = enhance(() => (
  <div style={{width: '0', height: '0'}}>
    <Notifications />
    <NewCollection />
    <EditMetadata />
  </div>
))

export default Footer
