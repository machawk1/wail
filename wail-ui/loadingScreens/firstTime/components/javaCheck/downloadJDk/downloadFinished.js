import React, { Component, PropTypes } from 'react'
import { Map } from 'immutable'
import { branch, renderComponent } from 'recompose'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import StartJdkInstall from './startJdkInstall'

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(StartJdkInstall)
  )

const enhance = displayWhich(props => !props.jdkInstall.get('wasError'))

const DownloadFinished = ({jdkInstall}) => (
  <CheckStepContent>
    <p>There was an error while initiating the JDK install process</p>
    <br />
    <p>{jdkInstall.get('stderr')}</p>
  </CheckStepContent>
)

DownloadFinished.propTypes = {
  jdkInstall: PropTypes.instanceOf(Map).isRequired,
  startInstall: PropTypes.func.isRequired
}

export default enhance(DownloadFinished)
