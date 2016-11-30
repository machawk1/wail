import React, {Component, PropTypes} from 'react'
import {Flex} from 'react-flex'
import {Card} from 'material-ui/Card'
import AddFromFsHeader from '../components/collections/addToCollection/addFromFsHeader'
import AddFromFs from '../components/collections/addToCollection/addFromFs'

const CollectionAddSeedFs = ({ params }) => (
  <div id='warcUpload' style={{ width: '100%', height: '100%' }}>
    <AddFromFsHeader col={params.col}/>
    <AddFromFs col={params.col}/>
  </div>
)

export default CollectionAddSeedFs
