import React from 'react'
import PropTypes from 'prop-types'
import { branch, renderComponent, shouldUpdate } from 'recompose'
import Flexbox from 'flexbox-react'
import { SSRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'
import {notFirstTimeLoading as nftl} from '../../../../constants/uiStrings'

const HeritrixStartError = ({serviceRec}) => {
  const {where, message} = serviceRec.getHeritrixErrorReport('hStartErReport')
  return (
    <p>
      {nftl.heritrixNotStart} <br />
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
      {nftl.waybackNotStart} <br />
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
    <Flexbox
      flexDirection='row'
      flexWrap='wrap'
      alignItems='center'
      justifyContent='space-between'>
      <HeritrixStartM serviceRec={serviceRec} />
      <WaybackStartM serviceRec={serviceRec} />
    </Flexbox>
  </CheckStepContent>
))

ServiceCheckMessage.propTypes = {
  serviceRec: PropTypes.instanceOf(SSRecord).isRequired,
  step: PropTypes.number.isRequired
}

export default ServiceCheckMessage
