import React, {Component, PropTypes} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import LoadingStore from './loadingStore'

const style = {
  container: {
    position: 'relative',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
}

export default class CheckServices extends Component {
  static propTypes = {
    firstLoad: PropTypes.bool.isRequired,
  }
  constructor (props, context) {
    super(props,context)
    this.state = {
      progMessage: props.firstLoad ? 'Waiting to check Services. Depends on Java Check.' : 'Checking Heritrix, Wayback Status',
      done: false
    }
  }

  componentWillMount(){
    LoadingStore.on('check-services',this.updateProgress)
    LoadingStore.on('service-check-done',this.done)
  }

  componentWillUnMount() {
    LoadingStore.removeListener('check-services',this.updateProgress)
    LoadingStore.removeListener('check-services',this.done)
  }

  @autobind
  done(){
    this.setState({done: true})
  }

  @autobind
  updateProgress(){
    let {progMessage} = LoadingStore.serviceMessage()
    this.setState({progMessage})
  }

  render () {
    var check_or_done
    if (this.state.done) {
      check_or_done = <SvgIcon />
    } else {
      check_or_done =
        <RefreshIndicator
          size={40}
          left={10}
          top={0}
          status='loading'
          style={style.refresh}
        />
    }
    return (
      <TableRow>
        <TableRowColumn>
          <p>
            {this.state.progMessage}
          </p>
        </TableRowColumn>
        <TableRowColumn>
          {check_or_done}
        </TableRowColumn>
      </TableRow>
    )
  }
}
