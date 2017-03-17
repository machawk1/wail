import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import RaisedButton from 'material-ui/RaisedButton'
import FixIcon from 'material-ui/svg-icons/action/build'
import KillIcon from 'material-ui/svg-icons/content/clear'
import ServiceStats from '../../records/serviceStatus'
import * as serviceAction from '../../actions/services'

const style = {
  servicesSS: {
    width: '80px',
    cursor: 'default'
  },
  servicesActionsH: {
    width: '200px',
    cursor: 'default',
    textAlign: 'center'
  },
  servicesActions: {
    width: '200px',
    cursor: 'default'
  },
  serviceActionButton: {
    margin: '10px'
  }
}

const actionMarginLeft = process.platform === 'win32' ? '30px' : '50px'

const stateToProps = state => ({
  serviceStatRec: state.get('serviceStatuses')
})

const dispatchToProps = dispatch => bindActionCreators(serviceAction, dispatch)

// old pywb 0.32.1
const ServiceStatus = (props) => {
  const {serviceStatRec, startHeritrix, stopHeritrix, startWayback, stopWayback} = props
  const hGood = serviceStatRec.get('heritrix'), wbGood = serviceStatRec.get('wayback')
  return (
    <Table>
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}
      >
        <TableRow>
          <TableHeaderColumn style={style.servicesSS}>Service</TableHeaderColumn>
          <TableHeaderColumn style={style.servicesSS}>State</TableHeaderColumn>
          <TableHeaderColumn style={style.servicesSS}>Version</TableHeaderColumn>
          <TableHeaderColumn style={style.servicesActionsH}>Actions</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        displayRowCheckbox={false}
        showRowHover={false}
      >
        <TableRow
          selectable={false}
        >
          <TableRowColumn style={style.servicesSS}>Wayback</TableRowColumn>
          <TableRowColumn id='waybackStatus' style={style.servicesSS}>{serviceStatRec.waybackStatus()}</TableRowColumn>
          <TableRowColumn style={style.servicesSS}>0.33.1</TableRowColumn>
          <TableRowColumn style={style.servicesActions}>
            <span style={{marginLeft: actionMarginLeft}}>
              <RaisedButton
                id='startWayback'
                disabled={wbGood}
                style={style.serviceActionButton}
                labelPosition='before'
                label='Start'
                onTouchTap={startWayback}
                icon={<FixIcon />}
              />
              <RaisedButton
                id='stopWayback'
                disabled={!wbGood}
                style={style.serviceActionButton}
                labelPosition='before'
                label='Stop'
                onTouchTap={stopWayback}
                icon={<KillIcon />}
              />
            </span>
          </TableRowColumn>
        </TableRow>
        <TableRow
          selectable={false}
        >
          <TableRowColumn style={style.servicesSS}>Heritrix</TableRowColumn>
          <TableRowColumn id='heritrixStatus'
                          style={style.servicesSS}>{serviceStatRec.heritrixStatus()}</TableRowColumn>
          <TableRowColumn style={style.servicesSS}>3.2.0</TableRowColumn>
          <TableRowColumn style={style.servicesActions}>
            <span style={{marginLeft: actionMarginLeft}}>
              <RaisedButton
                id='startHeritrix'
                disabled={hGood}
                style={style.serviceActionButton}
                labelPosition='before'
                label='Start'
                onTouchTap={startHeritrix}
                icon={<FixIcon />}
              />
              <RaisedButton
                id='stopHeritrix'
                disabled={!hGood}
                style={style.serviceActionButton}
                labelPosition='before'
                label='Stop'
                onTouchTap={stopHeritrix}
                icon={<KillIcon />}
              />
            </span>
          </TableRowColumn>
        </TableRow>
      </TableBody>
    </Table>
  )
}

ServiceStatus.propTypes = {
  serviceStatRec: PropTypes.instanceOf(ServiceStats),
  startHeritrix: PropTypes.func.isRequired,
  stopHeritrix: PropTypes.func.isRequired,
  startWayback: PropTypes.func.isRequired,
  stopWayback: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(ServiceStatus)
