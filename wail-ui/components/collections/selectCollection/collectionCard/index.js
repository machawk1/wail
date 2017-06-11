import React from 'react'
import PropTypes from 'prop-types'
import Card from 'material-ui/Card/Card'
import { Map } from 'immutable'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import CollectionCardHeader from './collectionCardHeader'
import CollectionCardBody from './collectionCardBody'
export NoCollectionMatches from './noCollectionMatches'

const enhance = namedUpdateKeys('CollectionCard', ['col', 'i'])

const CollectionCard = ({col, ccKey, i}) => (
  <Card key={`${ccKey}-collectioncard`} className='collectionCard'>
    <CollectionCardHeader i={i} key={`${ccKey}-collectioncard-header`} name={col.get('colName')} />
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
  i: PropTypes.number.isRequired,
  ccKey: PropTypes.string.isRequired
}

export default enhance(CollectionCard)
