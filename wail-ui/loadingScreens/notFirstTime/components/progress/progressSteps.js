import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Step, Stepper } from 'material-ui/Stepper'
import { onlyUpdateForKeys } from 'recompose'
import { setProps } from '../../../../util/recomposeHelpers'
import ServiceStep from '../serviceCheck/serviceCheckStep'
import UIStateStep from '../uiState/uiStateStep'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const propTypes = {
  step: PropTypes.number.isRequired
}

const enhance = setProps(propTypes, onlyUpdateForKeys(['step']))

const ProgressSteps = enhance(({step}) => (
  <Stepper activeStep={step}>
    <Step>
      <ServiceStep />
    </Step>
    <Step>
      <UIStateStep />
    </Step>
  </Stepper>
))

export default connect(stateToProps)(ProgressSteps)
