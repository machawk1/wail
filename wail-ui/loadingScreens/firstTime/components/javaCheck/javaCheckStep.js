import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import delay from 'lodash/delay'
import { compose, branch, setDisplayName, renderComponent, shouldUpdate } from 'recompose'
import { JavaCheckRecord } from '../../../records'
import { checkJava, nextLoadingStep } from '../../../actions'
import { CheckStepLabel, CheckStepWarningLabel } from '../../../shared/checkStepLabels'

const stateToProps = state => ({
  javaCheckRec: state.get('javaCheck'),
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  doCheck: bindActionCreators(checkJava, dispatch),
  nextStep: bindActionCreators(nextLoadingStep, dispatch)
})

const javaCheckLabler = (checkDone, download) => {
  if (checkDone && download) {
    return 'Checked Java Version Action Required'
  } else if (checkDone) {
    return 'Checked Java Version'
  } else {
    return 'Checking Java Version'
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {javaCheckRec, step} = stateProps
  const {doCheck, nextStep} = dispatchProps
  const checkDone = javaCheckRec.checkDone
  return {
    step,
    javaCheckRec,
    label: javaCheckLabler(checkDone, javaCheckRec.download),
    ownProps: Object.assign({}, ownProps, {completed: checkDone, disabled: false}),
    check () {
      if (!checkDone && step === 1) {
        console.log('JavaCheckStep doing check', step)
        delay(() => doCheck(), 1000)
      } else {
        console.log('JavaCheckStep check done', step)
        if (checkDone && step === 1) {
          console.log('JavaCheckStep check done next', step)
          delay(() => nextStep(), 1000)
        }
      }
    }
  }
}

const DisplayWarningLabel = ({ownProps, label, check, ...rest}) => (
  <CheckStepWarningLabel ownProps={ownProps} label={label} />
)

const maybeDisplayWarning = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(DisplayWarningLabel)
  )

const updateWhen = (props, nextProps) => props.step === 1 || nextProps.step === 1

const enhance = compose(
  setDisplayName('JavaCheckStep'),
  shouldUpdate(updateWhen),
  maybeDisplayWarning(props => props.javaCheckRec.download)
)

const JavaCheckStep = enhance(({ownProps, label, check, javaCheckRec, step}) => (
  <CheckStepLabel lid='JavaCheckStep' check={check} ownProps={ownProps} label={label} />
))

JavaCheckStep.propTypes = {
  step: PropTypes.number.isRequired,
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired,
  check: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(JavaCheckStep)
