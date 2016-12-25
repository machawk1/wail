import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shouldUpdate } from 'recompose'
import { UIStateRecord } from '../../../records'
import { CheckStepLabel } from '../../../shared/checkStepLabels'
import { notFirstLoadComplete } from '../../../actions'

const stateToProps = state => ({
  uiStateRec: state.get('uiState'),
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  loadingFinished: bindActionCreators(notFirstLoadComplete, dispatch)
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {uiStateRec, step} = stateProps
  const {loadingFinished} = dispatchProps
  const completed = uiStateRec.bothLoaded()
  return {
    uiStateRec,
    step,
    label: completed ? 'Loaded Collections and Crawls' : 'Loading Collections and Crawls',
    ownProps: Object.assign({}, ownProps, {completed, active: true, disabled: false}),
    check(){
      if (step === 1 && completed) {
        loadingFinished()
        console.log('finished')
      }
    }
  }
}

const enhance = shouldUpdate((props, nextProps) =>
  (props.step === 1 || nextProps.step === 1) || props.uiStateRec !== nextProps.uiStateRec
)

const UIStateStep = enhance((props) => (
  <CheckStepLabel {...props} />
))

UIStateStep.propTypes = {
  uiStateRec: PropTypes.instanceOf(UIStateRecord).isRequired,
  step: PropTypes.number.isRequired,
}

export default connect(stateToProps, dispatchToProps, mergeProps)(UIStateStep)
