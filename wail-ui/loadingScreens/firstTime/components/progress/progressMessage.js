import React, { PropTypes } from 'react'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { OsCheckContents } from '../osCheck'
import { JavaCheckContents } from '../javaCheck'

const enhance = compose(setDisplayName('ProgressMessage'), onlyUpdateForKeys([ 'step' ]))
const ProgressMessage = enhance(({ step, nextStep, prevStep }) => (
  <Stepper activeStep={step}>
    <Step>
      <OsCheckContents />
    </Step>
    <Step>
      <JavaCheckContents step={step}/>
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