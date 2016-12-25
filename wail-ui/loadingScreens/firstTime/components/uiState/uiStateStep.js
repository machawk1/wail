import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { send } from 'redux-electron-ipc'
import { shouldUpdate } from 'recompose'
import { UIStateRecord } from '../../../records'
import { CheckStepLabel } from '../../../shared/checkStepLabels'

const stateToProps = state => ({
  uiStateRec: state.get('uiState'),
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  loadingFinished () {
    dispatch(send('loading-finished'))
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {uiStateRec, step} = stateProps
  const {loadingFinished} = dispatchProps
  const completed = uiStateRec.bothLoaded()
  return {
    uiStateRec,
    step,
    label: 'Loading Collections and Crawls',
    ownProps: Object.assign({}, ownProps, {completed, active: true, disabled: false}),
    check(){
      if (step === 3 && completed) {
        // loadingFinished()
        console.log('finished')
      }
    }
  }
}

const enhance = shouldUpdate((props, nextProps) =>
  (props.step === 3 || nextProps.step === 3) || props.uiStateRec !== nextProps.uiStateRec
)

const UIStateStep = (props) => (
  <CheckStepLabel {...props} />
)

UIStateStep.propTypes = {
  uiStateRec: PropTypes.instanceOf(UIStateRecord).isRequired,
  step: PropTypes.number.isRequired,
}

export default connect(stateToProps, dispatchToProps, mergeProps)(enhance(UIStateStep))
