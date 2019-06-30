import React from 'react'
import PropTypes from 'prop-types'
import StepLabel from 'material-ui/Stepper/StepLabel'

const CheckStepLabel = ({ownProps, check, label, lid}) => {
  check()
  return (
    <StepLabel id={lid} {...ownProps}>{label}</StepLabel>
  )
}

CheckStepLabel.propTypes = {
  ownProps: PropTypes.object.isRequired,
  lid: PropTypes.string.isRequired,
  check: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
}

export default CheckStepLabel
