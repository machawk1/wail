import React from 'react'
import { AddFromFsHeader, AddFromFs } from '../components/collections/addToCollection'

const CollectionAddSeedFs = ({ match, history, location }) => (
  <div id='warcUpload' className='widthHeightHundoPercent'>
    <AddFromFsHeader col={match.params.col} />
    <AddFromFs col={match.params.col} />
  </div>
)

export default CollectionAddSeedFs
