import PropTypes from 'prop-types'
import React from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { CheckStepContent } from '../../../shared/checkStepContents'

const OsCheckNotDone = () => (
  <CheckStepContent>
    <p>For WAIL Setup</p>
  </CheckStepContent>
)

export default namedPure('OsCheckNotDone')(OsCheckNotDone)
