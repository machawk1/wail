import React, { Component } from "react"
import autobind from 'autobind-decorator'
import Snackbar from "material-ui/Snackbar"
import GMessageStore from "../../stores/globalMessageStore"

export default class Footer extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      message: 'Status Number 1',
      open: false,
    }

    this.timer = undefined


  }

  componentWillUnMount() {
    clearTimeout(this.timer)
  }

  @autobind
  receiveMessage(m){

  }

  @autobind
  closeNotification () {
    this.setState({
      open: false
    })
  }

  render () {
    return (
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={2000}
        onRequestClose={this.closeNotification}
      />
    )
  }
}
