import React from 'react'
import { Card } from 'material-ui/Card'
import { CollAddSeedHeader, ArchiveForm, CheckSeed } from '../components/collections/addToCollection'

const CollectionAddSeed = ({match, history, location}) => (
  <div style={{width: '100%', height: '100%'}}>
    <Card style={{margin: '0 25px 25px 25px', height: '75%'}} id='addSeedCard'>
      <ArchiveForm col={match.params.col}/>
      <CheckSeed col={match.params.col}/>
    </Card>
  </div>
)

export default CollectionAddSeed
