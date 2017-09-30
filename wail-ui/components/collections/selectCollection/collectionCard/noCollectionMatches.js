import React from 'react'
import PropTypes from 'prop-types'
import Card from 'material-ui/Card/Card'
import CardText from 'material-ui/Card/CardText'
import { collectionCard } from '../../../../constants/uiStrings'

function NoCollectionMatches ({search}) {
  return (
    <Card>
      <CardText>
        {collectionCard.noCollNamed(search)}
      </CardText>
    </Card>
  )
}

NoCollectionMatches.propTypes = {
  search: PropTypes.string.isRequired
}

export default NoCollectionMatches
