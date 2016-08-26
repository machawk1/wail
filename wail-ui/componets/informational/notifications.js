import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'
import { shell } from 'electron'
import GMessageStore from '../../stores/globalMessageStore'
import {
  ToastContainer,
  ToastMessage,
} from "react-toastr"

const ToastMessageFactory = React.createFactory(ToastMessage.animation)

export default class Notifications extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      message: 'Status Number 1',
      open: false,
    }
    this.toastr = null
  }

  componentWillMount () {
    GMessageStore.on('new-message', this.receiveMessage)
  }

  componentWillUnmount () {
    GMessageStore.removeListener('new-message', this.receiveMessage)
  }

  @autobind
  receiveMessage () {
    this.toastr.info(<p>
      {GMessageStore.getMessage()}
    </p>)
    // if (!this.state.open) {
    //   this.setState({ message: , open: true })
    // }
  }

  @autobind
  closeNotification () {
    if (GMessageStore.hasQueuedMessages()) {
      this.setState({ message: GMessageStore.getMessage() })
    } else {
      this.setState({
        open: false
      })
    }
  }

  render () {
    return (
    <ToastContainer
      toastMessageFactory={ToastMessageFactory}
      ref={(c) => this.toastr = c}
      preventDuplicates={true}
      newestOnTop={true}
      className="toast-top-center"
    />
    )
  }
}
/*
 <Snackbar
 open={this.state.open}
 message={this.state.message}
 autoHideDuration={2000}
 onRequestClose={this.closeNotification}
 />
 */
