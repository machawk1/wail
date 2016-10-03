import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import LoadingStore from './loadingStore'

const style = {
  container: {
    position: 'relative'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative'
  }
}

export default class WailInternals extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      progMessage: 'Loading WAIL Internals',
      done: false
    }
  }

  componentWillMount () {
    LoadingStore.on('internal-progress', this.updateProgress)
  }

  componentWillUnMount () {
    LoadingStore.removeListener('internal-progress', this.updateProgress)
  }

  @autobind
  updateProgress (progMessage) {
    this.setState({ progMessage })
  }

  render () {
    return (
      <p>
        {this.state.progMessage}
      </p>
    )
  }
}
