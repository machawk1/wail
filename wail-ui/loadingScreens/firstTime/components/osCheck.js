import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import delay from 'lodash/delay'
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper'
import { osCheck } from '../../actions'

const stateToProps = state => {
  const osCheck = state.get('osCheck')
  return {
    checkDone: osCheck.get('checkDone'),
    os: osCheck.get('os'),
    arch: osCheck.get('arch')
  }
}

const dispatchToProps = dispatch => ({
  check () {
    delay(() => dispatch(osCheck()), 3000)
  }
})

const OsCheck = ({ checkDone, os, arch, check }) => (
  <div>

  </div>
)