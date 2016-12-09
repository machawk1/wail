import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import Immutable from 'immutable'
import shallowCompare from 'react-addons-shallow-compare'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow} from 'material-ui/Table'
import MyAutoSizer from '../utilComponents/myAutoSizer'
import HJobItemContainer from './hJobItemContainer'
import styles from '../styles/styles'
const {
  crawlUrlS, statusS, timestampS,
  discoveredS, queuedS, downloadedS, actionS
} = styles.heritrixTable

const log = console.log.bind(console)
const stateToProps = state => ({ jobIds: state.get('jobIds') })

class Heritrix2 extends Component {
  static propTypes = {
    jobIds: PropTypes.instanceOf(Immutable.List).isRequired
  }
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }

  renderTr () {
    let trs = []
    let len = this.props.jobIds.size
    for (let i = 0; i < len; ++i) {
      let jobId = this.props.jobIds.get(i)
      trs.push(<HJobItemContainer key={`${i}-${jobId}`} jobId={jobId} />)
    }
    return trs
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const trs = this.renderTr()
    return (
      <MyAutoSizer findElement='hViewContainer'>
        {
          ({ height }) => (
            <Table
              height={`${height - 175}px`}
            >
              <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
              >
                <TableRow >
                  <TableHeaderColumn style={crawlUrlS}>
                    Crawl Url(s)
                  </TableHeaderColumn>
                  <TableHeaderColumn style={statusS}>
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn style={timestampS}>
                    Timestamp
                  </TableHeaderColumn>
                  <TableHeaderColumn style={discoveredS}>
                    Discovered
                  </TableHeaderColumn>
                  <TableHeaderColumn style={queuedS}>
                    Queued
                  </TableHeaderColumn>
                  <TableHeaderColumn style={downloadedS}>
                    Downloaded
                  </TableHeaderColumn>
                  <TableHeaderColumn style={actionS}>
                    Actions
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                displayRowCheckbox={false}
                showRowHover
              >
                {trs}
              </TableBody>
            </Table>
          )}
      </MyAutoSizer>
    )
  }
}

export default connect(stateToProps)(Heritrix2)
