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

export default class CheckServices2 extends Component {
  static propTypes = {
    firstLoad: PropTypes.bool.isRequired,
    wait: PropTypes.bool.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      progMessage: 'Checking Heritrix, Wayback Status',
      done: false
    }
  }

  componentWillMount () {
    LoadingStore.on('progress', this.updateProgress)
    LoadingStore.on('service-check-done', () => {
      console.log('service checking done!')
      this.done()
    })
  }

  componentDidMount () {
    LoadingDispatcher.dispatch({
      type: wc.Loading.JAVA_CHECK_DONE
    })
  }

  componentWillUnMount () {
    LoadingStore.removeListener('check-services', this.updateProgress)
    LoadingStore.removeListener('service-check-done', this.done)
  }

  @autobind
  done () {
    // add some latency to allow for the user to see our update as proof we did the on load check
    this.setState({ done: true }, () => {
      // console.log('checkServices done=true setState callback')
      LoadingDispatcher.dispatch({
        type: wc.Loading.SERVICE_CHECK_DONE
      })
    })
  }

  @autobind
  updateProgress () {
    let { progMessage } = LoadingStore.serviceMessage()
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
