import React from 'react'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { nextLoadingStep, prevLoadingStep } from '../../actions'
import { ProgressSteps, ProgressMessage } from '../components/progress'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  nextStep: bindActionCreators(nextLoadingStep, dispatch),
  prevStep: bindActionCreators(prevLoadingStep, dispatch)
})

const enhance = compose(setDisplayName('Progress'), onlyUpdateForKeys([ 'step' ]))

const Progress = enhance(({ step, nextStep, prevStep }) => (
  <div style={{ width: 'inherit', height: 'inherit' }}>
    <ProgressSteps step={step} nextStep={nextStep} prevStep={prevStep}/>
    <ProgressMessage step={step}/>
  </div>
))

export default connect(stateToProps, dispatchToProps)(Progress)