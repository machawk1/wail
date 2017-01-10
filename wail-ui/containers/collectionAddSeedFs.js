import React, { Component, PropTypes } from 'react'
import { AddFromFsHeader, AddFromFs } from '../components/collections/addToCollection'

const CollectionAddSeedFs = ({params}) => (
  <div id='warcUpload' style={{width: '100%', height: '100%'}}>
    <AddFromFsHeader col={params.col} />
    <AddFromFs col={params.col} />
  </div>
)

export default CollectionAddSeedFs
