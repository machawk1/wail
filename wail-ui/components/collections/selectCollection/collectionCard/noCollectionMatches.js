import React from 'react'
import PropTypes from 'prop-types'
import Card from 'material-ui/Card/Card'
import CardText from 'material-ui/Card/CardText'
import { namedPure } from '../../../../util/recomposeHelpers'
import { collectionCard } from '../../../../constants/uiStrings'

const enhance = namedPure('NoCollectionMatches')

const NoCollectionMatches = ({search}) => (
  <Card>
    <CardText>
      {collectionCard.noCollNamed(search)}
    </CardText>
  </Card>
)

NoCollectionMatches.propTypes = {
  search: PropTypes.string.isRequired
}

export default enhance(NoCollectionMatches)
