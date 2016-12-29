import React, { Component, PropTypes } from 'react'
import Immutable from 'immutable'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import { connect } from 'react-redux'
import styles from './heritrixInlineStyles'

const {
  crawlUrlS, statusS, timestampS,
  discoveredS, queuedS, downloadedS, actionS,forColS
} = styles

const stateToProps = (state, ownProps) => ({jobRecord: state.get('runs').get(`${ownProps.jobId}`)})

const log = console.log.bind(console)

class HeritrixJobItem extends Component {
  static propTypes = {
    jobId: PropTypes.number.isRequired,
    jobRecord: PropTypes.instanceOf(Immutable.Record).isRequired,
    actionMenu: PropTypes.element.isRequired
  }

  componentDidUpdate (prevProps, prevState, prevContext) {
    log(`HeritrixJobItem ${this.props.jobId} did update`)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {jobId, jobRecord} = this.props
    return jobId !== nextProps.jobId || jobRecord !== nextProps.jobRecord
  }

  render () {
    let {jobId, jobRecord, actionMenu} = this.props
    let job = jobRecord.latestRun
    let urls = jobRecord.displayUrls()
    return (
      <TableRow key={`${jobId}-TableRow`}>
        <TableRowColumn key={`${jobId}-TRCol-JID`} style={crawlUrlS}>
          {urls}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Stat`} style={statusS}>
          {job.status()}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-ForCol`} style={forColS}>
          {jobRecord.forCol}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Tstamp`} style={timestampS}>
          {job.tsMoment.format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Discov`} style={discoveredS}>
          {job.discovered}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Que`} style={queuedS}>
          {job.queued}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Dld`} style={downloadedS}>
          {job.downloaded}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Action`} style={actionS}>
          {actionMenu}
        </TableRowColumn>
      </TableRow>
    )
  }
}

export default connect(stateToProps)(HeritrixJobItem)
