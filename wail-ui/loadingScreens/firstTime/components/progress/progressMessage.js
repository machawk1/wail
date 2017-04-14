import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Step, Stepper, StepLabel } from 'material-ui/Stepper'
import { OsCheckContents } from '../osCheck'
import { JavaCheckContents } from '../javaCheck'
import ServiceContents from '../serviceCheck/serviceCheckMessage'
import UIStateContents from '../uiState/uiStateMessages'
import * as recs from '../../../records'

const stateToProps = state => ({
  step: state.get('loadingStep'),
  osCheckRec: state.get('osCheck'),
  javaCheckRec: state.get('javaCheck'),
  jdkDlRec: state.get('jdkDl'),
  serviceRec: state.get('services'),
  uiStateRec: state.get('uiState')
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
    <Step>
      <UIStateContents {...props} />
    </Step>
  </Stepper>
)

ProgressMessage.propTypes = {
  step: PropTypes.number.isRequired,
  serviceRec: PropTypes.instanceOf(recs.SSRecord).isRequired,
  osCheckRec: PropTypes.instanceOf(recs.OsCheckRecord).isRequired,
  javaCheckRec: PropTypes.instanceOf(recs.JavaCheckRecord).isRequired,
  jdkDlRec: PropTypes.instanceOf(recs.JdkDlRecord).isRequired,
  uiStateRec: PropTypes.instanceOf(recs.UIStateRecord).isRequired
}

export default connect(stateToProps)(ProgressMessage)
