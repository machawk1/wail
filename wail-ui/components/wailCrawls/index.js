import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { Flex } from 'react-flex'
import Flexbox from 'flexbox-react'
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

  renderWailCrawls (jobItems, {height,width}) {
    return(
      <Flexbox
        maxWidth={`${width}px`}
        flexGrow={1}
        maxHeight={`${height - 100}px`}
        flexWrap='wrap'
        flexDirection='row'
        alignItems='baseline'
        margin='10px'
      >
        {jobItems}
      </Flexbox>
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
