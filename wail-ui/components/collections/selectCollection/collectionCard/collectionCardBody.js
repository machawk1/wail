import React, { PropTypes } from 'react'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardText'
import { Flex } from 'react-flex'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'

const enhance = namedUpdateKeys('CollectionCardBody', ['added', 'mementos', 'conf'])

const CollectionCardBody = ({seeds, lastUpdated, size, description}) => (
  <div key={`CollectionCardBody-div-${name}`}>
    <Flex key={`CollectionCardBody-flex-${name}`} row alignItems='baseline' justifyContent='space-between'>
      <CardHeader key={`CollectionCardBody-${name}-seeds`} title={`Seeds: ${seeds}`} />
      <CardHeader key={`CollectionCardBody-${name}-lastUpdated`} title={`Last Archived: ${lastUpdated}`} />
      <CardHeader key={`CollectionCardBody-${name}-size`} title={`Size: ${size}`} />
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
