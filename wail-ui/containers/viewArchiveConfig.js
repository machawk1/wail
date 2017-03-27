import React from 'react'
import { ArchiveConfigTable, ViewArchiveConfigHeader } from '../components/collections/viewArchiveConfiguration'

const ViewArchiveConfig = ({ match, history, location }) => (
  <div id='viewArchiveConfigContainer' style={{width: '100%', height: '100%'}}>
    <ViewArchiveConfigHeader viewingCol={match.params.col} />
    <ArchiveConfigTable containerElement={'viewArchiveConfigContainer'} viewingCol={match.params.col} />
  </div>
)

export default ViewArchiveConfig
