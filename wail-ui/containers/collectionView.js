import React from 'react'
import ViewCollection from '../components/collections/viewCollection'

const CollectionView = ({ match, history, location }) => (
  <div className="widthHeightHundoPercent" id='collViewDiv'>
    <ViewCollection viewingCol={match.params.col} />
  </div>
)

export default CollectionView
