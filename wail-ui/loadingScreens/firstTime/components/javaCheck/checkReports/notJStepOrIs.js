import PropTypes from 'prop-types'
import React from 'react'
import { compose, branch, onlyUpdateForKeys, renderComponent, setDisplayName } from 'recompose'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import JavaCheckNotDone from './javaCheckNotDone'

const NotJavaStep = () => (
  <CheckStepContent>
    <p>Depends On OS Check</p>
  </CheckStepContent>
)

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(NotJavaStep)
  )

const enhance = compose(
  setDisplayName('JavaCheckNotDone'),
  onlyUpdateForKeys(['step']),
  displayWhich(props => props.step === 0 || props.step > 1)
)

const NotJStepOrIs = props => (
  <JavaCheckNotDone />
)

NotJStepOrIs.propTypes = {
  step: PropTypes.number.isRequired
}

export default enhance(NotJStepOrIs)
