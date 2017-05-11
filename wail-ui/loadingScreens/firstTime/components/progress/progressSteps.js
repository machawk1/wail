import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Step, Stepper } from 'material-ui/Stepper'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { OsCheckStep } from '../osCheck'
import { JavaCheckStep } from '../javaCheck'
import ServiceStep from '../serviceCheck/serviceCheckStep'
import UIStateStep from '../uiState/uiStateStep'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const enhance = namedUpdateKeys('ProgressSteps', ['step'])

const ProgressSteps = ({step}) => (
  <Stepper activeStep={step}>
    <Step>
      <OsCheckStep />
    </Step>
    <Step>
      <JavaCheckStep />
    </Step>
    <Step>
      <ServiceStep />
    </Step>
    <Step>
      <UIStateStep />
    </Step>
  </Stepper>
)

ProgressSteps.propTypes = {
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(ProgressSteps))
