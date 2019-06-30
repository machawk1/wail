import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { shouldUpdate } from 'recompose'
import { UIStateRecord } from '../../../records'
import { CheckStepLabel } from '../../../shared/checkStepLabels'
import { notFirstLoadComplete } from '../../../actions'
import {notFirstTimeLoading as nftl} from '../../../../constants/uiStrings'

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
    label: nftl.crawlsLoaded(completed),
    ownProps: Object.assign({}, ownProps, {completed, active: true, disabled: false}),
    check () {
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
  <CheckStepLabel lid='UIStateStep' {...props} />
))

UIStateStep.propTypes = {
  uiStateRec: PropTypes.instanceOf(UIStateRecord).isRequired,
  step: PropTypes.number.isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(UIStateStep)
