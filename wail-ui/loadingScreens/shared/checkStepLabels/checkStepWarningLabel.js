import React from 'react'
import PropTypes from 'prop-types'
import StepLabel from 'material-ui/Stepper/StepLabel'
import WarningIcon from 'material-ui/svg-icons/alert/warning'
import { red500 } from 'material-ui/styles/colors'

const CheckStepWarningLabel = ({ownProps, label}) => (
  <StepLabel
    icon={<WarningIcon color={red500} />}
    style={{color: red500}}
  >
    {label}
  </StepLabel>
)

CheckStepWarningLabel.propTypes = {
  ownProps: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired
}

export default CheckStepWarningLabel
