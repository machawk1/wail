import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table'
import MyAutoSizer from '../utilComponents/myAutoSizer'
import WailCralJob from './WailCrawlJob'

function stateToProps (state) {
  return {jobIds: state.get('wailCrawls').jobIds}
}

class WailCrawls extends Component {
  static propTypes = {
    jobIds: PropTypes.instanceOf(Immutable.List).isRequired
  }

  static contextTypes = {
    store: PropTypes.object
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.jobIds !== nextProps.jobIds
  }

  makeWailCralJobItems () {
    let trs = []
    let len = this.props.jobIds.size
    let i = 0
    for (; i < len; ++i) {
      let jobId = this.props.jobIds.get(i)
      trs.push(<WailCralJob i={i} key={`${i}-${jobId}`} jobId={jobId}/>)
    }
    return trs
  }

  renderWailCrawls (jobItems, {height}) {
    return (
      <Table
        height={`${height - 175}px`}
      >
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn className="wailCrawlUrl">
              URL
            </TableHeaderColumn>
            <TableHeaderColumn className="wailCrawlType">
              Type
            </TableHeaderColumn>
            <TableHeaderColumn>
              Collection
            </TableHeaderColumn>
            <TableHeaderColumn>
              Status
            </TableHeaderColumn>
            <TableHeaderColumn>
              Pages Left To Preserve
            </TableHeaderColumn>
            <TableHeaderColumn>
              Last Update
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
    const jobItems = this.makeWailCralJobItems()
    return (
      <MyAutoSizer findElement='wViewContainer'>
        {this.renderWailCrawls.bind(undefined, jobItems)}
      </MyAutoSizer>
    )
  }
}

export default connect(stateToProps)(WailCrawls)
