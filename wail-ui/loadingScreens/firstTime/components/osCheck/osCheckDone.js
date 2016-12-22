import React, { PropTypes } from 'react'
import { OsCheckRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'

const OsCheckDone = ({osCheckRec}) => (
  <CheckStepContent>
    <p>{`Running ${osCheckRec.get('os')} ${osCheckRec.get('arch')}`}</p>
  </CheckStepContent>
)

OsCheckDone.propTypes = {
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired
}

export default OsCheckDone
