import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import LinearProgress from 'material-ui/LinearProgress'
import { branch, renderComponent } from 'recompose'
import { Flex } from 'react-flex'
import { namedUpdateKeys } from '../../../../../util/recomposeHelpers'
import { JdkDlRecord } from '../../../../records'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import { startJdkInstall, installJdk } from '../../../../actions'
import DownloadFinished from './downloadFinished'

const stateToProps = state => ({
  jdkDlRec: state.get('jdkDl'),
  jdkInstall: state.get('jdkInstall')
})

const bindDispatch = dispatch => ({
  startInstall: bindActionCreators(startJdkInstall, dispatch),
  doInstall: bindActionCreators(installJdk, dispatch)
})

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(DownloadFinished)
  )

const enhance = displayWhich(props => props.jdkDlRec.get('finished'))
const enhance2 = namedUpdateKeys('DownloadDarwinJdk', ['jdkDlRec'])

const DownloadDarwinJdk = enhance2(({jdkDlRec}) => (
  <CheckStepContent>
    <p>Downloading The Java 1.7 JDK</p>
    <Flex row alignItems='center' justifyContent='space-between'>
      <span>Time Elapse: {jdkDlRec.get('elapsed')}</span>
      <span>Time Remaining: {jdkDlRec.get('remaining')}</span>
      <span>Download Speed: {jdkDlRec.get('speed')}</span>
    </Flex>
    <LinearProgress mode='determinate' value={jdkDlRec.get('percent')} />
  </CheckStepContent>
))

DownloadDarwinJdk.propTypes = {
  jdkDlRec: PropTypes.instanceOf(JdkDlRecord).isRequired
}

export default connect(stateToProps, bindDispatch)(enhance(DownloadDarwinJdk))
