import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, branch, shouldUpdate, renderComponent, setDisplayName, renderNothing } from 'recompose'
import { JdkDlRecord } from '../../../../records'
import AskDownload from './askDownload'
import DownloadDarwinJdk from './downloadDarwinJdk'

const stateToProps = state => ({
  jdkDlRec: state.get('jdkDl')
})

const displayWhich = shouldDisplay =>
  branch(
    props => shouldDisplay(props),
    renderComponent(AskDownload)
  )

const updateWhen = (props, nextProps) => props.step === 1 || nextProps.step === 1

const enhance = displayWhich(props => !props.jdkDlRec.get('started'))

const DownloadJdk = enhance(({jdkDlRec}) => (
  <DownloadDarwinJdk jdkDlRec={jdkDlRec}/>
))

DownloadJdk.propTypes = {
  jdkDlRec: PropTypes.instanceOf(JdkDlRecord).isRequired
}

export default connect(stateToProps)(DownloadJdk)
