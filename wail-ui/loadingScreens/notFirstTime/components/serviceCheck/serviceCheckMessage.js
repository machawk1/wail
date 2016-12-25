import React, { PropTypes } from 'react'
import { branch, renderComponent, shouldUpdate } from 'recompose'
import { Flex } from 'react-flex'
import { SSRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'

const HeritrixStartError = ({serviceRec}) => {
  const {where, message} = serviceRec.getHeritrixErrorReport('hStartErReport')
  return (
    <p>
      Heritrix Could Not Be Started <br/>
      {where} : {message}
    </p>
  )
}

const maybeDisplayHError = branch(
  props => props.serviceRec.get('hError'),
  renderComponent(HeritrixStartError)
)

const HeritrixStartM = maybeDisplayHError(({serviceRec}) => (
  <p>{serviceRec.heritrixStatusMessage()}</p>
))

const WaybackStartError = ({serviceRec}) => {
  const {where, message} = serviceRec.getWaybackErrorReport('hStartErReport')
  return (
    <p>
      Wayback Could Not Be Started <br/>
      {where} : {message}
    </p>
  )
}

const maybeDisplayWError = branch(
  props => props.serviceRec.get('wError'),
  renderComponent(WaybackStartError)
)

const WaybackStartM = maybeDisplayWError(({serviceRec}) => (
  <p>{serviceRec.waybackStatusMessage()}</p>
))

const updateWhen = (props, nextProps) => props.step === 0 || nextProps.step === 0

const enhance = shouldUpdate(updateWhen)

const ServiceCheckMessage = enhance(({serviceRec}) => (
  <CheckStepContent>
    <Flex row alignItems='center' justifyContent='space-between'>
      <HeritrixStartM serviceRec={serviceRec}/>
      <WaybackStartM serviceRec={serviceRec}/>
    </Flex>
  </CheckStepContent>
))

ServiceCheckMessage.propTypes = {
  serviceRec: PropTypes.instanceOf(SSRecord).isRequired,
  step: PropTypes.number.isRequired
}

export default ServiceCheckMessage
