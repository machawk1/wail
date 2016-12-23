import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import { OsCheckContents } from '../osCheck'
import { JavaCheckContents } from '../javaCheck'
import ServiceContents from '../serviceCheck/serviceCheckMessage'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const enhance = namedUpdateKeys('ProgressMessage', ['step'])

const ProgressMessage = ({step}) => (
  <Stepper activeStep={step} orientation='vertical'>
    <Step>
      <OsCheckContents />
    </Step>
    <Step>
      <JavaCheckContents step={step}/>
    </Step>
    <Step>
      <ServiceContents step={step}/>
    </Step>
  </Stepper>
)

ProgressMessage.propTypes = {
  step: PropTypes.number.isRequired
}

export default connect(stateToProps)(enhance(ProgressMessage))
