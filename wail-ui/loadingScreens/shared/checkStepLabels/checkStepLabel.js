import React, { PropTypes } from 'react'
import StepLabel from 'material-ui/Stepper/StepLabel'

const CheckStepLabel = ({ownProps, check, label}) => {
  check()
  return (
    <StepLabel {...ownProps}>{label}</StepLabel>
  )
}

CheckStepLabel.propTypes = {
  ownProps: PropTypes.object.isRequired,
  check: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
}

export default CheckStepLabel
