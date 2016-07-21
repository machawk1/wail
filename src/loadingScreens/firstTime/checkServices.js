import React, {Component, PropTypes} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import SvgIcon from 'material-ui/svg-icons/action/done'

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
  constructor (props, context) {
    super()
    this.state = {
      progMessage: 'Waiting to check Services. Depends on Java Check.',
      done: false
    }
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
