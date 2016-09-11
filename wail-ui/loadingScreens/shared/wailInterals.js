import React, {Component, PropTypes} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import LoadingStore from './loadingStore'
import LoadingDispatcher from './loadingDispatcher'
import wc from '../../constants/wail-constants'

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
