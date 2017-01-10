import React, { Component, PropTypes } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { CheckStepContent } from '../../../../shared/checkStepContents'

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
        <p>
          The Java 1.7 JDK download is completed.<br />
          WAIL will initiate the Java 1.7 JDK install process and <br />
          exit when it starts.
          Start this process?
        </p>
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
