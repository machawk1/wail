import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'
import { shell } from 'electron'
import GMessageStore from '../../stores/globalMessageStore'
import FitText from 'react-fittext'
import Notification from 'react-notification-system'

// https://github.com/igorprado/react-notification-system

export default class Notifications extends Component {
  static contextTypes = {
    logger: PropTypes.object.isRequired,
  }
  constructor (props, context) {
    super(props, context)
    console.log(context)
    this.state = {
      message: 'Status Number 1',
      open: false
    }
    this.notifier = null
  }

  componentWillMount () {
    GMessageStore.on('new-message', this.receiveMessage)
  }

  componentWillUnmount () {
    GMessageStore.removeListener('new-message', this.receiveMessage)
  }

  @autobind
  receiveMessage () {
    let message = GMessageStore.getMessage()
    this.notifier.addNotification(message)
    this.context.logger.info(message.message)
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
      <Notification ref={(c) => { this.notifier = c }} />
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
