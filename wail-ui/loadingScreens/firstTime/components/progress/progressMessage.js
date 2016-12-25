import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Step, Stepper, StepLabel, } from 'material-ui/Stepper'
import { OsCheckContents } from '../osCheck'
import { JavaCheckContents } from '../javaCheck'
import ServiceContents from '../serviceCheck/serviceCheckMessage'
import * as recs from '../../../records'

const jccStyle = {
  borderLeft: '1px solid rgb(189, 189, 189)',
  minHeight: '75px'
}

const stateToProps = state => ({
  step: state.get('loadingStep'),
  osCheckRec: state.get('osCheck'),
  javaCheckRec: state.get('javaCheck'),
  jdkDlRec: state.get('jdkDl'),
  serviceRec: state.get('services')
})

const ProgressMessage = (props) => (
  <Stepper style={{minHeight: '163px'}} activeStep={props.step} orientation='vertical'>
    <Step>
      <OsCheckContents {...props} />
    </Step>
    <Step>
      <JavaCheckContents {...props} />
    </Step>
    <Step>
      <ServiceContents {...props} />
    </Step>
  </Stepper>
)

ProgressMessage.propTypes = {
  step: PropTypes.number.isRequired,
  serviceRec: PropTypes.instanceOf(recs.SSRecord).isRequired,
  osCheckRec: PropTypes.instanceOf(recs.OsCheckRecord).isRequired,
  javaCheckRec: PropTypes.instanceOf(recs.JavaCheckRecord).isRequired,
  jdkDlRec: PropTypes.instanceOf(recs.JdkDlRecord).isRequired
}

export default connect(stateToProps)(ProgressMessage)
