import React, {Component, PropTypes} from 'react'
import {Flex} from 'react-flex'
import {Card} from 'material-ui/Card'
import CollAddSeedHeader from '../components/collections/addToCollection/colAddSeedHeader'
import ArchiveForm from '../components/collections/addToCollection/archiveUrlForm'
import CheckSeed from '../components/collections/addToCollection/checkSeed'
import CheckResults from '../components/collections/addToCollection/checkResults'

const CollectionAddSeed = ({ params }) => (
  <div style={{ width: '100%', height: '100%' }}>
    <CollAddSeedHeader col={params.col}/>
    <Card style={{ margin: '0 25px 25px 25px', height: '70%' }} id='addSeedCard'>
      <ArchiveForm />
      <CheckSeed col={params.col} />
    </Card>
  </div>
)

export default CollectionAddSeed
