import React, {Component} from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import autobind from 'autobind-decorator'
import ServiceStore from '../../stores/serviceStore'

export default class StatusDialog extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      open: false,
      serviceMessage: "",
      action: null
    }
  }

  componentWillMount () {
    ServiceStore.on('statusDialog', this.showDialog)
  }

  componentWillUnmount () {
    ServiceStore.removeListener('statusDialog', this.showDialog)
  }

  @autobind
  showDialog () {
    let actionMessage = ServiceStore.statusActionMessage()
    this.setState({
      open: true,
      serviceMessage: actionMessage.message,
      action: actionMessage.actions[ actionMessage.actionIndex ]
    })
  }

  @autobind
  handleCloseDisregard () {
    this.setState({ open: false })
  }

  @autobind
  handleCloseFix () {
    this.setState({ open: false })
    if (this.state.action) {
      this.state.action()
    }
  }

  render () {
    const actions = [
      <FlatButton
        label="No"
        primary={true}
        onTouchTap={this.handleCloseDisregard}
      />,
      <FlatButton
        label="Yes"
        primary={true}
        onTouchTap={this.handleCloseFix}
      />
    ]
    return (
      <Dialog
        title="Service Status Update"
        actions={actions}
        modal={true}
        open={this.state.open}
      >
        {this.state.serviceMessage}
      </Dialog>
    )
  }
}
