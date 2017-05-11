import PropTypes from 'prop-types'
import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import {remote} from 'electron'
import { red500 } from 'material-ui/styles/colors'
import { CheckStepContent } from '../../../../shared/checkStepContents'
import { downloadJDK } from '../../../../actions'
import {firstTimeLoading as ftl} from '../../../../../constants/uiStrings'

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
      message: ftl.askNoDlJavaDialogue,
      cancelId: 666,
      buttons: ['No', 'Yes']
    }
    dialog.showMessageBox(remote.getCurrentWindow(), opts, (choice) => {
      console.log(choice)
      if (choice === 1) {
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
        <p dangerouslySetInnerHTML={{__html: ftl.downloadJDKExplaination()}}></p>
        <RaisedButton
          label='Yes'
          disableTouchRipple
          disableFocusRipple
          primary
          disabled={this.state.dlButtonDisabled}
          onTouchTap={::this.startDownload}
          style={{marginRight: 12}}
        />
        <RaisedButton
          label='No'
          disableTouchRipple
          disableFocusRipple
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
