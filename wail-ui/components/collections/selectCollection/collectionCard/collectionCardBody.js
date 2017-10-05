import React from 'react'
import PropTypes from 'prop-types'
import CardHeader from 'material-ui/Card/CardHeader'
import Flexbox from 'flexbox-react'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { collectionCard} from '../../../../constants/uiStrings'

const enhance = namedUpdateKeys('CollectionCardBody', ['added', 'mementos', 'conf'])

const CollectionCardBody = ({seeds, lastUpdated, size, description, name}) => (
  <div key={`CollectionCardBody-div-${name}`} className='collectionCardBody'>
    <Flexbox
      key={`CollectionCardBody-flex-${name}`}
      flexDirection='row'
      flexWrap='wrap'
      alignItems='baseline'
      justifyContent='space-between'
    >
      <CardHeader
        titleStyle={{padding: 0}}
        textStyle={{padding: 10}}
        style={{padding: 5}}
        className='collectionCardBodyInfo'
        key={`CollectionCardBody-${name}-seeds`}
        title={collectionCard.seedCount(seeds)} />
      <CardHeader
        style={{padding: 5}}
        textStyle={{padding: 10}}
        titleStyle={{padding: 0}}
        className='collectionCardBodyInfo'
        key={`CollectionCardBody-${name}-size`}
        title={collectionCard.collSize(size)} />
    </Flexbox>
    <CardHeader
      style={{padding: 5}}
      textStyle={{padding: 10}}
      titleStyle={{padding: 0}}
      className='collectionCardBodyInfo'
      key={`CollectionCardBody-${name}-lastUpdated`}
      title={collectionCard.lastArchived(lastUpdated)} />
  </div>
)

CollectionCardBody.propTypes = {
  seeds: PropTypes.number.isRequired,
  lastUpdated: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default enhance(CollectionCardBody)
