import React, {Component, PropTypes} from 'react'
import ViewCollection from '../components/collections/viewCollection'

const CollectionView = ({ params }) => (
  <div style={{ width: '100%', height: '100%' }} id='collViewDiv'>
    <ViewCollection viewingCol={params.col} />
  </div>
)

export default CollectionView
