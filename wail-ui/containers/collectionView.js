import React from 'react'
import ViewCollection from '../components/collections/viewCollection'

const CollectionView = ({ match, history, location }) => (
  <div style={{ width: '100%', height: '100%' }} id='collViewDiv'>
    <ViewCollection viewingCol={match.params.col} />
  </div>
)

export default CollectionView
