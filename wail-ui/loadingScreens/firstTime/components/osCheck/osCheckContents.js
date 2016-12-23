import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose, branch, onlyUpdateForKeys, renderComponent, setDisplayName } from 'recompose'
import { OsCheckRecord } from '../../../records'
import OsCheckNotDone from './osCheckNotDone'
import OsCheckDone from './osCheckDone'

const stateToProps = state => ({
  osCheckRec: state.get('osCheck')
})

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
  <OsCheckDone osCheckRec={osCheckRec}/>
))

OsCheckContents.propTypes = {
  osCheckRec: PropTypes.instanceOf(OsCheckRecord).isRequired
}

export default connect(stateToProps)(OsCheckContents)