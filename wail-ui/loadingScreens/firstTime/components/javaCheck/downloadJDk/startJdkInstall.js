import PropTypes from 'prop-types'
import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import { firstTimeLoading as ftl } from '../../../../../constants/uiStrings'

class StartJdkInstall extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      dlButtonDisabled: false
    }
  }

  startDownload () {
    console.log('starting download')
    this.setState({dlButtonDisabled: true}, () => {
      this.props.startInstall()
    })
  }

  render () {
    if (this.props.jdkInstall.get('started')) {
      this.props.doInstall()
    }
    return (
      <CheckStepContent>
        <p dangerouslySetInnerHTML={{__html: ftl.jdkDlFinishedAskStartInstall()}} />
        <RaisedButton
          label='Yes'
          disableTouchRipple
          disableFocusRipple
          primary
          disabled={this.state.dlButtonDisabled}
          onTouchTap={::this.startDownload}
          style={{marginRight: 12}}
        />
      </CheckStepContent>
    )
  }
}

StartJdkInstall.propTypes = {
  startInstall: PropTypes.func.isRequired,
  doInstall: PropTypes.func.isRequired
}

export default StartJdkInstall
