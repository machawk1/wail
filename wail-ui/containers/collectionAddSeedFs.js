import React, { Component, PropTypes } from 'react'
import { AddFromFsHeader, AddFromFs } from '../components/collections/addToCollection'

const CollectionAddSeedFs = ({ match,history,location }) => (
  <div id='warcUpload' style={{width: '100%', height: '100%'}}>
    <AddFromFsHeader col={match.params.col} />
    <AddFromFs col={match.params.col} />
  </div>
)

export default CollectionAddSeedFs
