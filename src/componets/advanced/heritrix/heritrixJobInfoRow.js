import React, { Component, PropTypes } from 'react'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import moment from 'moment'

const style = {
  tableHeaderCol: {
    paddingLeft: '12px',
    paddingRight: '12px',
    cursor: 'default'
  },
  tableHeader: {
    borderBottomStyle: 'none',
    cursor: 'default'
  },
  tableRowCol: {
    paddingLeft: '5px',
    paddingRight: '5px',
    wordWrap: 'break-word',
    textOverflow: 'none',
    whiteSpace: 'normal',
    cursor: 'default'
  },
  trcTextCenter: {
    paddingLeft: '5px',
    paddingRight: '5px',
    wordWrap: 'break-word',
    textOverflow: 'none',
    whiteSpace: 'normal',
    textAlign: 'left',
    cursor: 'default'
  }

}

export default class HeritrixJobInfoRow extends Component {
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    runs: PropTypes.array.isRequired
  }

  render () {
    let runs = this.props.runs
    if (runs.length > 0) {
      let job = runs[ 0 ]
      let status = job.ended ? 'Ended' : 'Running'
      let discovered = job.discovered || ''
      let queued = job.queued || ''
      let downloaded = job.downloaded || ''
      console.log('the job being displayed', job)
      return (
        <TableRow key={`${this.props.jobId}-TableRow`} displayBorder={false}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={style.tableRowCol}>
            {this.props.jobId}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={style.tableRowCol}>
            {status}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={style.tableRowCol}>
            {moment(job.timestamp).format('MM/DD/YYYY h:mm:ssa')}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={style.tableRowCol}>
            {discovered}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={style.tableRowCol}>
            {queued}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={style.tableRowCol}>
            {downloaded}
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={`${this.props.jobId}-TableRow`} displayBorder={false}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={style.tableRowCol}>
            {this.props.jobId}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={style.tableRowCol}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={style.tableRowCol}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={style.tableRowCol}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={style.tableRowCol}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={style.tableRowCol}>0</TableRowColumn>
        </TableRow>
      )
    }
  }
}
