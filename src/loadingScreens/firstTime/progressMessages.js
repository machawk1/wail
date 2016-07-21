import React, {Component} from 'react'
import autobind from 'autobind-decorator'
import LoadingStore from '../storeDispatcher/loadingStore'


export default class ProgressMessages extends Component {
  constructor (props, context) {
    super()
    this.state = {
      statusMessage: LoadingStore.progressMessage(),
    }
  }

  componentWillMount () {
    LoadingStore.on('progress', this.update)
  }

  componentWillUnmount () {
    LoadingStore.removeListener('progress', this.update)
  }

  @autobind
  update() {
    this.setState({ statusMessage: LoadingStore.progressMessage() })
  }

  render () {
    return ( <p>{this.state.statusMessage}</p> )
  }
}
