import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose, shouldUpdate, setDisplayName } from 'recompose'
import { SSRecord } from '../../../records'
import { startHeritrix, startWayback } from '../../../actions'
import { CheckStepLabel } from '../../../shared/checkStepLabels'

const stateToProps = state => ({
  step: state.get('loadingStep'),
  serviceRec: state.get('services'),
})

const dispatchToProps = dispatch => ({
  startH: bindActionCreators(startHeritrix, dispatch),
  startW: bindActionCreators(startWayback, dispatch)
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {serviceRec, step} = stateProps
  const {bothStarted, hStarted, wStarted} = serviceRec.startStatus()
  const {startH, startW} = dispatchProps
  return {
    step,
    serviceRec,
    label: 'Start Services',
    ownProps: Object.assign({}, ownProps, {completed: bothStarted}),
    check () {
      if (!bothStarted && step === 3) {
        if (!hStarted) {
          startH()
        } else {
          startW()
        }
      }
    }
  }
}

const updateWhen = (props, nextProps) => props.step === 2 || nextProps.step === 2

const enhance = compose(
  setDisplayName('ServiceCheckStep'),
  shouldUpdate(updateWhen)
)

const ServiceCheckStep = enhance(({ownProps, label, check, osCheckRec, step}) => (
  <CheckStepLabel check={check} ownProps={ownProps} label={label}/>
))

ServiceCheckStep.propTypes = {
  step: PropTypes.number.isRequired,
  serviceRec: PropTypes.instanceOf(SSRecord).isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(ServiceCheckStep)