import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { OsCheckStep } from '../osCheck'
import { JavaCheckStep } from '../javaCheck'
import ServiceStep from '../serviceCheck/serviceCheckStep'

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
      <ServiceStep/>
    </Step>
  </Stepper>
)

ProgressSteps.propTypes = {
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(ProgressSteps))
