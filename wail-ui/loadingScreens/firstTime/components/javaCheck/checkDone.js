import React, { PropTypes } from 'react'
import StepLabel from 'material-ui/Stepper/StepLabel'
import StepContent from 'material-ui/Stepper/StepContent'
import { JavaCheckRecord } from '../../../records'

const JavaCheckDone = ({ownProps, javaCheckRec}) => {
  const checkL = `${javaCheckRec.haveReport()} ${javaCheckRec.haveCorrectReport()} ${javaCheckRec.downloadReport()}`
  return (
    <div>
      <StepLabel {...ownProps}>Checked Java Version</StepLabel>
      <StepContent active><span>{checkL}</span></StepContent>
    </div>
  )
}

JavaCheckDone.propTypes = {
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired,
  ownProps: PropTypes.object.isRequired,
}

export default JavaCheckDone
