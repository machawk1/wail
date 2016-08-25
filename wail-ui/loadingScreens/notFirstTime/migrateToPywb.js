import React, { Component, PropTypes } from 'react'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'
import wc from '../../constants/wail-constants'

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
    migrate: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      progMessage: props.migrate ? 'Waiting to Migrate. Depends on Checking Heritrix, Wayback Status' : 'Migrating to pywb',
      done: false
    }
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
