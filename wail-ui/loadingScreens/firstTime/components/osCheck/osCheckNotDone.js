import React, { PropTypes } from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { CheckStepContent } from '../../../shared/checkStepContents'

const OsCheckNotDone = () => (
  <CheckStepContent>
    <p>For WAIL Setup</p>
  </CheckStepContent>
)

export default namedPure('OsCheckNotDone')(OsCheckNotDone)
