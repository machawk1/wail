import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { nextLoadingStep, prevLoadingStep } from '../../../actions'
import { OsCheckStep } from '../osCheck'
import { JavaCheckStep } from '../javaCheck'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  nextStep: bindActionCreators(nextLoadingStep, dispatch),
  prevStep: bindActionCreators(prevLoadingStep, dispatch)
})

const getStepContent = (stepIndex) => {
  switch (stepIndex) {
    case 0:
      return 'Select campaign settings...'
    case 1:
      return 'What is an ad group anyways?'
    case 2:
      return 'This is the bit I really care about!'
    default:
      return 'You\'re a long way from home sonny jim!'
  }
}
const enhance = compose(setDisplayName('ProgressSteps'), onlyUpdateForKeys(['step']))
const ProgressSteps = enhance(({step, nextStep, prevStep}) => (
  <div>
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
    <div>
      <p>{getStepContent(step)}</p>
      <div style={{marginTop: 12}}>
        <FlatButton
          label="Back"
          disabled={step === 0}
          onTouchTap={prevStep}
          style={{marginRight: 12}}
        />
        <RaisedButton
          label={step === 2 ? 'Finish' : 'Next'}
          primary={true}
          onTouchTap={nextStep}
        />
      </div>
    </div>
  </div>
))

ProgressSteps.propTypes = {
  step: PropTypes.number.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(ProgressSteps)