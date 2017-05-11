import React from 'react'
import PropTypes from 'prop-types'
import { Map } from 'immutable'
import { branch, renderComponent } from 'recompose'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import StartJdkInstall from './startJdkInstall'
import {firstTimeLoading as ftl} from '../../../../../constants/uiStrings'


const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(StartJdkInstall)
  )

const enhance = displayWhich(props => !props.jdkInstall.get('wasError'))

const DownloadFinished = ({jdkInstall}) => (
  <CheckStepContent>
    <p>{ftl.jdkDlInitiatingError}</p>
    <br />
    <p>{jdkInstall.get('stderr')}</p>
  </CheckStepContent>
)

DownloadFinished.propTypes = {
  jdkInstall: PropTypes.instanceOf(Map).isRequired,
  startInstall: PropTypes.func.isRequired
}

export default enhance(DownloadFinished)
