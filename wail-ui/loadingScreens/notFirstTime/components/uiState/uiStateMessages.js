import React, { PropTypes } from 'react'
import { onlyUpdateForKeys } from 'recompose'
import { UIStateRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'

const enhance = onlyUpdateForKeys(['uiStateRec'])

const UIStateMessage = enhance(({uiStateRec}) => (
  <CheckStepContent>
    <p>{uiStateRec.archiveMessage()}<br/>{uiStateRec.crawlMessage()}</p>
  </CheckStepContent>
))

UIStateMessage.propTypes = {
  uiStateRec: PropTypes.instanceOf(UIStateRecord).isRequired,
}

export default UIStateMessage
