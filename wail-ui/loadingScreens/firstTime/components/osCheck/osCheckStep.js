import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import delay from 'lodash/delay'
import { compose, shouldUpdate, setDisplayName } from 'recompose'
import { OsCheckRecord } from '../../../records'
import { osCheck, nextLoadingStep } from '../../../actions'
import { CheckStepLabel } from '../../../shared/checkStepLabels'
import {firstTimeLoading as ftl} from '../../../../constants/uiStrings'

const stateToProps = state => ({
  osCheckRec: state.get('osCheck'),
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  doCheck: bindActionCreators(osCheck, dispatch),
  nextStep: bindActionCreators(nextLoadingStep, dispatch)
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {osCheckRec, step} = stateProps
  const checkDone = osCheckRec.checkDone
  return {
    step,
    osCheckRec,
    label: ftl.osCheckStepLabel(checkDone),
    ownProps: Object.assign({}, ownProps, {completed: checkDone}),
    check () {
      const {doCheck, nextStep} = dispatchProps
      if (!checkDone && step === 0) {
        console.log('osCheckStep doing check', step)
        delay(() => doCheck(), 2000)
      } else {
        console.log('osCheckStep check done', step)
        if (checkDone && step === 0) {
          console.log('osCheckStep check done next', step)
          delay(() => nextStep(), 1000)
        }
      }
    }
  }
}

const updateWhen = (props, nextProps) => props.step === 0 || nextProps.step === 0

const enhance = compose(
  setDisplayName('OsCheckStep'),
  shouldUpdate(updateWhen)
)

const OsCheckStep = enhance(({ownProps, label, check, osCheckRec, step}) => (
  <CheckStepLabel lid='OsCheckStep' check={check} ownProps={ownProps} label={label} />
))

OsCheckStep.propTypes = {
  step: PropTypes.number.isRequired,
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired,
  check: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(OsCheckStep)
