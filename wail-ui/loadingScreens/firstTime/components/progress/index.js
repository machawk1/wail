import React from 'react'
import { compose, setDisplayName, onlyUpdateForKeys } from 'recompose'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { nextLoadingStep, prevLoadingStep } from '../../../actions'
import ProgressSteps from './progressSteps'
import ProgressMessage from './progressMessage'

const stateToProps = state => ({
  step: state.get('loadingStep')
})

const dispatchToProps = dispatch => ({
  nextStep: bindActionCreators(nextLoadingStep, dispatch),
  prevStep: bindActionCreators(prevLoadingStep, dispatch)
})

const enhance = compose(setDisplayName('Progress'), onlyUpdateForKeys(['step']))

const Progress = enhance(({step, nextStep, prevStep}) => (
  <div>

  </div>
))