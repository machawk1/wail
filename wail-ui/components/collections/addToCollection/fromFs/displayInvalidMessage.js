import PropTypes from 'prop-types'
import React from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardText'
import Divider from 'material-ui/Divider'
import { addToCollection } from '../../../../constants/uiStrings'

const DisplayInvalidMessage = ({hadErrors}) => (
  <div>
    <CardTitle
      title={addToCollection.warcOrArcProcessingError}
    />
    <Divider />
    <CardHeader
      title={hadErrors[0].name}
    />
    <CardHeader title='Message Received During Processing' />
    <CardText>
      {hadErrors[0].error}
    </CardText>
  </div>
)

DisplayInvalidMessage.propTypes = {
  hadErrors: PropTypes.array.isRequired
}

export default DisplayInvalidMessage
