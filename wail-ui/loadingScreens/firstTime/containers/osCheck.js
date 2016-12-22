import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import delay from 'lodash/delay'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { OsCheckRecord } from '../../records'
import { osCheck, nextLoadingStep } from '../../actions'
import { OsCheckNotDone, OsCheckDone } from '../components/osCheck'

const stateToProps = state => ({
  osCheckRec: state.get('osCheck')
})

const dispatchToProps = dispatch => ({
  doCheck: bindActionCreators(osCheck, dispatch),
  nextStep: bindActionCreators(nextLoadingStep, dispatch)
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {osCheckRec} = stateProps
  return {
    osCheckRec,
    ownProps: Object.assign({}, ownProps, {completed: osCheckRec.get('checkDone')}),
    check () {
      const {doCheck, nextStep} = dispatchProps
      if (!osCheckRec.get('checkDone')) {
        delay(() => doCheck(), 2000)
      } else {
        delay(() => nextStep(), 1000)
      }
    }
  }
}

const enhance = compose(setDisplayName('OsCheck'), onlyUpdateForKeys(['osCheckRec']))

const OsCheck = enhance(({ownProps, osCheckRec, check}) => {
  check()
  const checkDone = osCheckRec.get('checkDone')
  return (
    <div>
      {checkDone && <OsCheckDone osCheckRec={osCheckRec} ownProps={ownProps}/>}
      {!checkDone && <OsCheckNotDone ownProps={ownProps}/>}
    </div>
  )
})

OsCheck.propTypes = {
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired,
  check: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps, mergeProps)(OsCheck)