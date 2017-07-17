import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Immutable from 'immutable'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import { connect } from 'react-redux'

function stateToProps (state, ownProps) {
  return {jobRecord: state.get('wailCrawls').getJob(ownProps.jobId)}
}

class WailCrawlJob extends Component {
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    i: PropTypes.number.isRequired,
    jobRecord: PropTypes.instanceOf(Immutable.Record).isRequired,
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.jobId !== nextProps.jobId || this.props.jobRecord !== nextProps.jobRecord
  }

  render () {
    let {jobId, jobRecord} = this.props
    return (
      <TableRow id={`wji${this.props.i}`} key={`${jobId}-TableRow`}>
        <TableRowColumn key={`${jobId}-TRCol-Url`} className="wailCrawlUrl">
          {jobRecord.uri_r}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Type`}>
          {jobRecord.type}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-ForCol`}>
          {jobRecord.forCol}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Status`}>
          {jobRecord.status()}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Queued`}>
          {jobRecord.queued}
        </TableRowColumn>
        <TableRowColumn key={`${jobId}-TRCol-Last-Updated`}>
          {jobRecord.lastUpdated}
        </TableRowColumn>
      </TableRow>
    )
  }
}

export default connect(stateToProps)(WailCrawlJob)

