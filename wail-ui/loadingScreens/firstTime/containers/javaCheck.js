import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import delay from 'lodash/delay'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { JavaCheckRecord } from '../../records'
import { checkJava, nextLoadingStep } from '../../actions'
import { JavaCheckNotDone, JavaCheckDone} from '../components/javaCheck'

const stateToProps = state => ({
  javaCheckRec: state.get('javaCheck')
})

const dispatchToProps = dispatch => ({
  doCheck: bindActionCreators(checkJava, dispatch),
  nextStep: bindActionCreators(nextLoadingStep, dispatch)
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {javaCheckRec} = stateProps
  return {
    javaCheckRec,
    ownProps: Object.assign({}, ownProps, {completed: javaCheckRec.get('checkDone')}),
    check () {
      const {doCheck, nextStep} = dispatchProps
      if (!javaCheckRec.get('checkDone')) {
        doCheck()
      } else {
        delay(() => nextStep(), 1000)
      }
    }
  }
}

const enhance = compose(setDisplayName('JavaCheck'), onlyUpdateForKeys(['javaCheckRec']))

const JavaCheck = enhance(({ownProps, javaCheckRec, check}) => {
  check()
  const checkDone = javaCheckRec.get('checkDone')
  return (
    <div>
      {checkDone && <JavaCheckDone javaCheckRec={javaCheckRec} ownProps={ownProps}/>}
      {!checkDone && <JavaCheckNotDone ownProps={ownProps}/>}
    </div>
  )
})

JavaCheck.propTypes = {
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired,
  check: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(JavaCheck)