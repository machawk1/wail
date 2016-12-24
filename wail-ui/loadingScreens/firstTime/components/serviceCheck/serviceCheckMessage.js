import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose, branch, setDisplayName, renderComponent, shouldUpdate } from 'recompose'
import { Flex } from 'react-flex'
import { SSRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'

const stateToProps = state => ({
  serviceRec: state.get('services'),
})

const HeritrixStartError = ({ serviceRec }) => {
  const { where, error } = serviceRec.get('hStartErReport')
  return (
    <span>
      Heritrix Could Not Be Started <br/>
      {where} : {error}
    </span>
  )
}

const maybeDisplayHError = branch(
  props => props.serviceRec.get('hError'),
  renderComponent(HeritrixStartError)
)

const HeritrixStartM = maybeDisplayHError(({ serviceRec }) => (
  <span>{serviceRec.heritrixStatusMessage()}</span>
))

const WaybackStartError = ({ serviceRec }) => {
  const { where, error } = serviceRec.get('wStartErReport')
  return (
    <span>
      Wayback Could Not Be Started <br/>
      {where} : {error}
    </span>
  )
}

const maybeDisplayWError = branch(
  props => props.serviceRec.get('wError'),
  renderComponent(WaybackStartError)
)

const WaybackStartM = maybeDisplayWError(({ serviceRec }) => (
  <span>{serviceRec.waybackStatusMessage()}</span>
))

const NotServiceStep = () => (
  <CheckStepContent>
    <span>Depends On Java Check</span>
  </CheckStepContent>
)

const onlyDisplayOnStep = branch(
  props => props.step !== 2,
  renderComponent(NotServiceStep)
)

const updateWhen = (props, nextProps) => props.step === 2 || nextProps.step === 2

const enhance = compose(
  shouldUpdate(updateWhen),
  onlyDisplayOnStep
)

const ServiceCheckMessage = ({ serviceRec }) => (
  <CheckStepContent>
    <Flex row alignItems='center' justifyContent='space-between'>
      <HeritrixStartM serviceRec={serviceRec}/>
      <WaybackStartM serviceRec={serviceRec}/>
    </Flex>
  </CheckStepContent>
)

ServiceCheckMessage.propTypes = {
  serviceRec: PropTypes.instanceOf(SSRecord).isRequired,
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(ServiceCheckMessage))
