import React from 'react'
import PropTypes from 'prop-types'
import CardHeader from 'material-ui/Card/CardHeader'
import Flexbox from 'flexbox-react'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'

const enhance = namedUpdateKeys('MementoCardBody', ['added', 'mementos', 'conf'])

const MementoCardBody = ({added, mementos, conf}) => (
  <Flexbox
    key={`MementoCardBody-flex-${added}-${mementos}`}
    flexDirection='row'
    flexWrap='wrap'
    alignItems='baseline'
    justifyContent='space-between'>
    <CardHeader
      key={`MementoCardBody-mementos-${added}-${mementos}`}
      title={`Mementos: ${mementos}`}

    />
    <CardHeader
      key={`MementoCardBody-confTitle-${added}-${mementos}`}
      title='Archive Configuration'
      subtitle={conf}
    />
  </Flexbox>
)

MementoCardBody.propTypes = {
  mementos: PropTypes.number.isRequired,
  conf: PropTypes.any.isRequired
}

export default enhance(MementoCardBody)
