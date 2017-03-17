import React, { PropTypes } from 'react'
import Card from 'material-ui/Card/Card'
import { Map } from 'immutable'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import CollectionCardHeader from './collectionCardHeader'
import CollectionCardBody from './collectionCardBody'
export NoCollectionMatches from './noCollectionMatches'

const enhance = namedUpdateKeys('CollectionCard', [ 'col' ])

const noVirtualWidth = (vstyle) => {
  delete vstyle.width
  return vstyle
}

const CollectionCard = ({ col, ccKey }) => (
  <Card key={`${ccKey}-collectioncard`} style={{ marginTop: 10, marginBottom: 10}}>
    <CollectionCardHeader key={`${ccKey}-collectioncard-header`} name={col.get('colName')}/>
    <CollectionCardBody
      key={`${ccKey}-collectioncard-body`}
      seeds={col.get('seeds').size}
      lastUpdated={col.get('lastUpdated').format('MMM DD YYYY h:mma')}
      size={col.get('size')}
      description={col.get('metadata').get('description')}
    />
  </Card>
)

CollectionCard.propTypes = {
  col: PropTypes.instanceOf(Map).isRequired,
  ccKey: PropTypes.string.isRequired
}

export default enhance(CollectionCard)