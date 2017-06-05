import React from 'react'
import PropTypes from 'prop-types'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardText'
import { Flex } from 'react-flex'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { collectionCard} from '../../../../constants/uiStrings'

const enhance = namedUpdateKeys('CollectionCardBody', ['added', 'mementos', 'conf'])

const CollectionCardBody = ({seeds, lastUpdated, size, description}) => (
  <div key={`CollectionCardBody-div-${name}`} className="collectionCardBody">
    <Flex key={`CollectionCardBody-flex-${name}`} row alignItems='baseline' >
      <CardHeader titleStyle={{padding: 0}} className="collectionCardBodyInfo" key={`CollectionCardBody-${name}-seeds`}
                  title={collectionCard.seedCount(seeds)}/>
      <CardHeader titleStyle={{padding: 0}} className="collectionCardBodyInfo" key={`CollectionCardBody-${name}-size`}
                  title={collectionCard.collSize(size)}/>
      <CardHeader titleStyle={{padding: 0}} className="collectionCardBodyInfo" key={`CollectionCardBody-${name}-lastUpdated`}
                  title={collectionCard.lastArchived(lastUpdated)}/>
    </Flex>
    <CardText>
      {description}
    </CardText>
  </div>
)

CollectionCardBody.propTypes = {
  seeds: PropTypes.number.isRequired,
  lastUpdated: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default enhance(CollectionCardBody)
