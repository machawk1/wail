import React from 'react'
import PropTypes from 'prop-types'
import { OsCheckRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'
import { firstTimeLoading as ftl } from '../../../../constants/uiStrings'

const OsCheckDone = ({osCheckRec}) => (
  <CheckStepContent>
    <p>{ftl.osCheckDone(osCheckRec.get('os'), osCheckRec.get('arch'))}</p>
  </CheckStepContent>
)

OsCheckDone.propTypes = {
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired
}

export default OsCheckDone
