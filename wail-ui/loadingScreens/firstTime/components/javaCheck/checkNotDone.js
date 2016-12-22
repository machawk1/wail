import React, { PropTypes } from 'react'
import StepLabel from 'material-ui/Stepper/StepLabel'

const JavaCheckNotDone = ({ownProps}) => {
  return (<StepLabel {...ownProps}>Checking Java Version</StepLabel>)
}

JavaCheckNotDone.propTypes = {
  ownProps: PropTypes.object.isRequired
}

export default JavaCheckNotDone
