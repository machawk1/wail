import React, {Component, PropTypes} from 'react'
import GMessageStore from '../../stores/globalMessageStore'
import Notification from 'react-notification-system'

// https://github.com/igorprado/react-notification-system

export default class Notifications extends Component {
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
    GMessageStore.on('new-message', ::this.receiveMessage)
  }

  componentWillUnmount () {
    GMessageStore.removeListener('new-message', ::this.receiveMessage)
  }

  receiveMessage () {
    console.log('reciever message')
    let message = GMessageStore.getMessage()
    this.notifier.addNotification(message)
  }

  render () {
    return (
      <Notification ref={(c) => { this.notifier = c }} />
    )
  }
}
