import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Step, Stepper } from 'material-ui/Stepper'
import ServiceContents from '../serviceCheck/serviceCheckMessage'
import UIStateContents from '../uiState/uiStateMessages'
import * as recs from '../../../records'

const stateToProps = state => ({
  step: state.get('loadingStep'),
  serviceRec: state.get('services'),
  uiStateRec: state.get('uiState')
})

const ProgressMessage = (props) => (
  <Stepper activeStep={props.step} orientation='vertical'>
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
  uiStateRec: PropTypes.instanceOf(recs.UIStateRecord).isRequired
}

export default connect(stateToProps)(ProgressMessage)
