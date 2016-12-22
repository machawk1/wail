import React, { PropTypes } from 'react'
import StepContent from 'material-ui/Stepper/StepContent'
import { JavaCheckRecord } from '../../../../records'

const JavaCheckDone = ({javaCheckRec}) => {
  const checkL = `${javaCheckRec.haveReport()} ${javaCheckRec.haveCorrectReport()} ${javaCheckRec.downloadReport()}`
  return (
    <div>
      <StepContent active><span>{checkL}</span></StepContent>
    </div>
  )
}

JavaCheckDone.propTypes = {
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired,
}

export default JavaCheckDone
