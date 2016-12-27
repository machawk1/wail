import React, { Component, PropTypes } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {remote} from 'electron'
import { red500 } from 'material-ui/styles/colors'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import { downloadJDK } from '../../../../actions'


class AskDownload extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      dlButtonDisabled: false
    }
  }

  showNoDialog () {
    const {dialog} = remote
    const opts = {
      type: 'warning',
      title: 'Required',
      message: 'Downloading and installing of JDK 1.7 on MacOS is required.\nYou will not be able to use WAIL without it. Are you sure you do not want to download?',
      cancelId: 666,
      buttons: ['No','Yes']
    }
    dialog.showMessageBox(remote.getCurrentWindow(),opts,(choice) => {
      console.log(choice)
      if (choice === 1){
        console.log('yes')
      } else {
        console.log('no')
        this.startDownload()
      }
    })
  }

  startDownload () {
    console.log('starting download')
    this.setState({dlButtonDisabled: true}, () => {
      this.context.store.dispatch(downloadJDK())
    })
  }

  render () {
    return (
      <CheckStepContent>
        <p>
          Usage of Heritrix through WAIL requires the Java 1.7 JDK (Java Developer Kit)<br/>
          to be installed. This is required and WAIL will guide you through the installation<br/>
          process. Do you wish to download and install this JDK?
        </p>
        <RaisedButton
          label='Yes'
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary
          disabled={this.state.dlButtonDisabled}
          onTouchTap={::this.startDownload}
          style={{marginRight: 12}}
        />
        <RaisedButton
          label='No'
          disableTouchRipple={true}
          disableFocusRipple={true}
          secondary
          disabled={this.state.dlButtonDisabled}
          onTouchTap={::this.showNoDialog}
          style={{color: red500}}
        />
      </CheckStepContent>
    )
  }
}

AskDownload.contextTypes = {
  store: PropTypes.object.isRequired
}

export default AskDownload