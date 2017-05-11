import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table'
import MyAutoSizer from '../utilComponents/myAutoSizer'
import HJobItemContainer from './hJobItemContainer'
import HertrixJobItem from './heritrixJobItem'
import HeritrixJobCard from './heritrixJobCard'
import HeritrixActionMenu from './heritrixActionMenu'
import styles from './heritrixInlineStyles'
import { heritrix, general } from '../../constants/uiStrings'
const {
  crawlUrlS, statusS, timestampS,
  discoveredS, queuedS, downloadedS, actionS, forColS
} = styles

const log = console.log.bind(console)
const stateToProps = state => ({jobIds: state.get('jobIds')})

class Heritrix extends Component {
  static propTypes = {
    jobIds: PropTypes.instanceOf(Immutable.List).isRequired
  }

  static contextTypes = {
    store: PropTypes.object
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.jobIds !== nextProps.jobIds
  }

  makeHeritrixJobItems () {
    let trs = []
    let len = this.props.jobIds.size, i = 0
    for (; i < len; ++i) {
      let jobId = this.props.jobIds.get(i)
      trs.push(<HertrixJobItem i={i} key={`${i}-${jobId}`} jobId={jobId} actionMenu={
        <HeritrixActionMenu jobId={jobId} i={i}/>
      }/>)
    }
    return trs
  }

  renderHeritrixJobItems (jobItems, {height}) {
    return (
      <Table
        height={`${height - 175}px`}
      >
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow >
            <TableHeaderColumn style={crawlUrlS}>
              {heritrix.crawlUrls}
            </TableHeaderColumn>
            <TableHeaderColumn style={statusS}>
              {general.status}
            </TableHeaderColumn>
            <TableHeaderColumn style={forColS}>
              {heritrix.forCollection}
            </TableHeaderColumn>
            <TableHeaderColumn style={timestampS}>
              {heritrix.tstamp}
            </TableHeaderColumn>
            <TableHeaderColumn style={discoveredS}>
              {heritrix.discovered}
            </TableHeaderColumn>
            <TableHeaderColumn style={queuedS}>
              {heritrix.queued}
            </TableHeaderColumn>
            <TableHeaderColumn style={downloadedS}>
              {heritrix.dled}
            </TableHeaderColumn>
            <TableHeaderColumn style={actionS}>
              {heritrix.actions}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover
        >
          {jobItems}
        </TableBody>
      </Table>
    )
  }

  render () {
    const jobItems = this.makeHeritrixJobItems()
    return (
      <MyAutoSizer findElement='hViewContainer'>
        {this.renderHeritrixJobItems.bind(undefined, jobItems)}
      </MyAutoSizer>
    )
  }
}

export default connect(stateToProps)(Heritrix)
