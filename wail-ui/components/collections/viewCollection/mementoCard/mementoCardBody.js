import React from 'react'
import PropTypes from 'prop-types'
import CardHeader from 'material-ui/Card/CardHeader'
import { Flex } from 'react-flex'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'

const enhance = namedUpdateKeys('MementoCardBody', ['added', 'mementos', 'conf'])

const MementoCardBody = ({added, mementos, conf}) => (
  <Flex key={`MementoCardBody-flex-${added}-${mementos}`} row alignItems='baseline' justifyContent='space-between'>
    <CardHeader key={`MementoCardBody-mementos-${added}-${mementos}`} title={`Mementos: ${mementos}`} />
    <CardHeader key={`MementoCardBody-confTitle-${added}-${mementos}`} title='Archive Configuration' subtitle={conf} />
  </Flex>
)

MementoCardBody.propTypes = {
  mementos: PropTypes.number.isRequired,
  conf: PropTypes.any.isRequired
}

export default enhance(MementoCardBody)
