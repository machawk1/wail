import PropTypes from 'prop-types'
import React from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardText'
import Divider from 'material-ui/Divider'
import { addToCollection } from '../../../../constants/uiStrings'


function DisplayInvalidMessage ({ hadErrors }) {
  return [
    <CardTitle
      key={`dim-card-title-${hadErrors[ 0 ].name}`}
      title={addToCollection.warcOrArcProcessingError}
    />,
    <Divider
      key={`dim-divider-${hadErrors[ 0 ].name}`}
    />,
    <CardHeader
      key={`dim-title-name-${hadErrors[ 0 ].name}`}
      title={hadErrors[ 0 ].name}
    />,
    <CardHeader
      key={`dim-message-header-${hadErrors[ 0 ].name}`}
      title='Message Received During Processing'
    />,
    <CardText
      key={`dim-error-message-${hadErrors[ 0 ].name}`}
    >
      {hadErrors[ 0 ].error}
    </CardText>
  ]
}

DisplayInvalidMessage.propTypes = {
  hadErrors: PropTypes.array.isRequired
}

export default DisplayInvalidMessage
