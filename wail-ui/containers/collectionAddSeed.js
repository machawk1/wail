import React from 'react'
import { Card } from 'material-ui/Card'
import { CollAddSeedHeader, ArchiveForm, CheckSeed } from '../components/collections/addToCollection'

const CollectionAddSeed = ({params}) => (
  <div style={{width: '100%', height: '100%'}}>
    <CollAddSeedHeader col={params.col}/>
    <Card style={{margin: '0 25px 25px 25px', height: '55%'}} id='addSeedCard'>
      <ArchiveForm col={params.col}/>
      <CheckSeed col={params.col}/>
    </Card>
  </div>
)

export default CollectionAddSeed
