import React, { PropTypes } from 'react'
import Card from 'material-ui/Card/Card'
import CardText from 'material-ui/Card/CardText'
import { namedPure } from '../../../../util/recomposeHelpers'

const enhance = namedPure('NoCollectionMatches')

const NoCollectionMatches = ({ search }) => (
  <Card>
    <CardText>
      No Collection named: {search}
    </CardText>
  </Card>
)

NoCollectionMatches.propTypes = {
  search: PropTypes.string.isRequired
}

export default enhance(NoCollectionMatches)