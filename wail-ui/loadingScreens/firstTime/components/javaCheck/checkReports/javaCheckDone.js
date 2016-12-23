import React, { PropTypes } from 'react'
import { compose, branch, renderComponent, setDisplayName } from 'recompose'
import { JavaCheckRecord } from '../../../../records'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import DownloadJDK from '../downloadJDk'

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(DownloadJDK)
  )

const enhance = compose(
  setDisplayName('JavaCheckDone'),
  displayWhich(props => props.javaCheckRec.get('download'))
)

const JavaCheckDone = enhance(({javaCheckRec}) => (
  <CheckStepContent>
    <p>
      {`${javaCheckRec.haveReport()}`}
      <br/>
      {`${javaCheckRec.haveCorrectReport()}`}
      <br/>
      {`${javaCheckRec.downloadReport()}`}
    </p>
  </CheckStepContent>
))

JavaCheckDone.propTypes = {
  javaCheckRec: PropTypes.instanceOf(JavaCheckRecord).isRequired
}

export default JavaCheckDone
