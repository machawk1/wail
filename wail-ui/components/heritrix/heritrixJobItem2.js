import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import {connect} from 'react-redux'
import styles from '../styles/styles'
import stringWidth from 'string-width'
import TRCToolTip from './trcToolTip'
const {
  crawlUrlS, statusS, timestampS,
  discoveredS, queuedS, downloadedS, actionS
} = styles.heritrixTable


@connect((state, ownProps) => ({
  jobRecord: state.get('crawls').get(`${ownProps.jobId}`)
}))
export default class HeritrixJobItem extends Component {
  static propTypes = {
    jobId: PropTypes.number.isRequired,
    jobRecord: PropTypes.instanceOf(Immutable.Record).isRequired,
    actionMenu: PropTypes.element.isRequired
  }

  render () {
    let { jobId, jobRecord, actionMenu } = this.props
    let runs = jobRecord.get('runs')
    if (runs.size > 0) {
      let job = jobRecord.get('latestRun')
      if (job.get('ended')) {
        console.log('ended')
      }
      let urls = jobRecord.displayUrls()
      return (
        <TableRow key={`${jobId}-TableRow`}>
          <TableRowColumn key={`${jobId}-TRCol-JID`} style={crawlUrlS}>
            {urls}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Stat`} style={statusS}>
            {job.status()}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Tstamp`} style={timestampS}>
            {job.get('tsMoment').format('MMM DD YYYY h:mma')}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Discov`} style={discoveredS}>
            {job.get('discovered')}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Que`} style={queuedS}>
            {job.get('queued')}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Dld`} style={downloadedS}>
            {job.get('downloaded')}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Action`} style={actionS}>
            {actionMenu}
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={`${jobId}-TableRow`}>
          <TableRowColumn key={`${jobId}-TRCol-JID`} style={crawlUrlS}>
            {jobRecord.displayUrls()}
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Stat`} style={statusS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Tstamp`} style={timestampS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Discov`} style={discoveredS}>0</TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Que`} style={queuedS}>0</TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Dld`} style={downloadedS}>0</TableRowColumn>
          <TableRowColumn key={`${jobId}-TRCol-Action`} style={actionS}>>
            {actionMenu}
          </TableRowColumn>
        </TableRow>
      )
    }
  }
}
