import React, {Component, PropTypes} from 'react'
import {CollectionViewHeader} from '../components/collections/viewCollection'
const CollectionView = ({ params }) => (
  <div style={{ width: '100%', height: '100%' }} id='collViewDiv'>
    <CollectionViewHeader />
  </div>
)

export default CollectionView