import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import shallowCompare from 'react-addons-shallow-compare'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import {connect} from 'react-redux'
import styles from '../styles/styles'

const {
  crawlUrlS, statusS, timestampS,
  discoveredS, queuedS, downloadedS, actionS
} = styles.heritrixTable

const stateToProps = (state, ownProps) => ({ jobRecord: state.get('crawls').get(`${ownProps.jobId}`) })

class HeritrixJobItem extends Component {
  static propTypes = {
    jobId: PropTypes.number.isRequired,
    jobRecord: PropTypes.instanceOf(Immutable.Record).isRequired,
    actionMenu: PropTypes.element.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let { jobId, jobRecord, actionMenu } = this.props
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
