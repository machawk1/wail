import React, { PropTypes } from 'react'
import { compose, branch, onlyUpdateForKeys, renderComponent, setDisplayName } from 'recompose'
import { OsCheckRecord } from '../../../records'
import OsCheckNotDone from './osCheckNotDone'
import OsCheckDone from './osCheckDone'

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(OsCheckNotDone)
  )

const enhance = compose(
  setDisplayName('OsCheckContents'),
  onlyUpdateForKeys(['osCheckRec']),
  displayWhich(props => !props.osCheckRec.get('checkDone'))
)

const OsCheckContents = enhance(({osCheckRec}) => (
  <OsCheckDone osCheckRec={osCheckRec} />
))

OsCheckContents.propTypes = {
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired
}

export default OsCheckContents
