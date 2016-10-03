import React, {Component, PropTypes} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import moment from 'moment'
import {joinStrings} from 'joinable'
import styles from '../styles/styles'
import GMessageDispatcher from '../../dispatchers/globalMessageDispatcher'
const {
  crawlUrlS,
  statusS,
  timestampS,
  discoveredS,
  queuedS,
  downloadedS,
  actionS
} = styles.heritrixTable

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

const textSize = 12

export default class HeritrixJobInfoRow extends Component {
  static propTypes = {
    urls: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]).isRequired,
    jobId: PropTypes.number.isRequired,
    runs: PropTypes.array.isRequired,
    actionMenu: PropTypes.element.isRequired
  }

  render () {
    let runs = this.props.runs
    var url
    if (Array.isArray(this.props.urls)) {
      url = joinStrings(...this.props.urls, { separator: ',' })
    } else {
      url = this.props.urls
    }
    if (runs.length > 0) {
      let job = runs[ 0 ]
      let status = job.ended ? 'Ended' : 'Running'
      let discovered = job.discovered || ''
      let queued = job.queued || ''
      let downloaded = job.downloaded || ''
      if (job.ended) {
        GMessageDispatcher.dispatch({
          title: 'Crawl Finished!',
          level: 'success',
          message: `Crawl for ${url} has finished`,
          uid: `Crawl for ${url} has finished`,
          autoDismiss: 0
        })
      }
      // console.log('the job being displayed', job)
      return (
        <TableRow key={`${this.props.jobId}-TableRow`}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={crawlUrlS}>
            <p>{url}</p>
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={statusS}>
            {status}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={timestampS}>
            {moment(job.timestamp).format('MM/DD/YYYY h:mm:ssa')}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={discoveredS}>
            {discovered}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={queuedS}>
            {queued}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={downloadedS}>
            {downloaded}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Action`} style={actionS}>
            {this.props.actionMenu}
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={`${this.props.jobId}-TableRow`}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={crawlUrlS}>
            <p>{url}</p>
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={statusS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={timestampS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={discoveredS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={queuedS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={downloadedS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Action`} style={actionS}>
            {this.props.actionMenu}
          </TableRowColumn>
        </TableRow>
      )
    }
  }
}
