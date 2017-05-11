import React from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { CheckStepContent } from '../../../shared/checkStepContents'
import {firstTimeLoading as ftl} from '../../../../constants/uiStrings'

const OsCheckNotDone = () => (
  <CheckStepContent>
    <p>{ftl.forWailSetup}</p>
  </CheckStepContent>
)

export default namedPure('OsCheckNotDone')(OsCheckNotDone)
