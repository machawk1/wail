import React, { Component } from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import { launchHeritrix, killHeritrix } from '../../actions/heritrix-actions'
import { startWayback, killWayback } from '../../actions/wayback-actions'
import ServiceStore from '../../stores/serviceStore'
import style from '../styles/styles'

export default class General extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      wbGood: ServiceStore.waybackStatus(),
      hGood: ServiceStore.heritrixStatus()
    }
  }

  componentWillMount () {
    ServiceStore.on('heritrix-status-update', this.updateHeritrixStatus)
    ServiceStore.on('wayback-status-update', this.updateWaybackStatus)
    ServiceStore.on('monitor-status-update', this.servicesUpdated)
  }

  componentWillUnmount () {
    ServiceStore.removeListener('heritrix-status-update', this.updateHeritrixStatus)
    ServiceStore.removeListener('wayback-status-update', this.updateWaybackStatus)
    ServiceStore.removeListener('monitor-status-update', this.servicesUpdated)
  }

  @autobind
  servicesUpdated () {
    let status = ServiceStore.serviceStatus
    this.setState({ wbGood: status.wayback, hGood: status.heritrix })
  }

  @autobind
  updateWaybackStatus () {
    this.setState({ wbGood: ServiceStore.waybackStatus() })
  }

  @autobind
  updateHeritrixStatus () {
    this.setState({ hGood: ServiceStore.heritrixStatus() })
  }

  wayBackFix (event) {
    console.log('Wayback fix')
    startWayback()
  }

  wayBackKill (event) {
    console.log('Wayback Kill')
    killWayback()
  }

  heritrixFix (event) {
    console.log(' Generalv HeritrixTab fix')
    launchHeritrix()
  }

  heritrixKill (event) {
    console.log('General HeritrixTab Kill')
    killHeritrix()
  }

  render () {
    const waybackStatus = this.state.wbGood ? 'Running' : 'X'
    const heritrixStatus = this.state.hGood ? 'Running' : 'X'
    return (
      <Table>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn style={style.cursor}>Service Status</TableHeaderColumn>
            <TableHeaderColumn style={style.cursor}>State</TableHeaderColumn>
            <TableHeaderColumn style={style.cursor}>Version</TableHeaderColumn>
            <TableHeaderColumn style={style.cursor} />
            <TableHeaderColumn style={style.cursor} />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover={true}
        >
          <TableRow>
            <TableRowColumn style={style.cursor}>Wayback</TableRowColumn>
            <TableRowColumn style={style.cursor}>{waybackStatus}</TableRowColumn>
            <TableRowColumn style={style.cursor}>2.3.1</TableRowColumn>
            <TableRowColumn><RaisedButton label="Fix" onMouseDown={this.wayBackFix} /> </TableRowColumn>
            <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.wayBackKill} /></TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn style={style.cursor}>Heritrix</TableRowColumn>
            <TableRowColumn style={style.cursor}>{heritrixStatus}</TableRowColumn>
            <TableRowColumn>3.3.0</TableRowColumn>
            <TableRowColumn><RaisedButton label="Fix" onMouseDown={this.heritrixFix} /></TableRowColumn>
            <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.heritrixKill} /></TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    )
  }
}
