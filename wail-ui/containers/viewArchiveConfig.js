import React from 'react'
import { ArchiveConfigTable, ViewArchiveConfigHeader } from '../components/collections/viewArchiveConfiguration'

const ViewArchiveConfig = ({params}) => (
  <div id='viewArchiveConfigContainer' style={{width: '100%', height: '100%'}}>
    <ViewArchiveConfigHeader viewingCol={params.col} />
    <ArchiveConfigTable containerElement={'viewArchiveConfigContainer'} viewingCol={params.col} />
  </div>
)

export default ViewArchiveConfig
