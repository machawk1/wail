import React, { PropTypes } from 'react'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { OsCheckStep } from '../osCheck'
import { JavaCheckStep } from '../javaCheck'

const enhance = compose(setDisplayName('ProgressMessage'), onlyUpdateForKeys(['step']))
const ProgressMessage = enhance(({step, nextStep, prevStep}) => (
  <Stepper activeStep={step}>
    <Step>
      <OsCheckStep />
    </Step>
    <Step>
      <JavaCheckStep />
    </Step>
    <Step>
      <StepLabel>Create an ad</StepLabel>
    </Step>
  </Stepper>
))

ProgressMessage.propTypes = {
  step: PropTypes.number.isRequired
}

export default ProgressMessage