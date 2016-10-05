import React, { Component, PropTypes } from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import autobind from 'autobind-decorator'
import CrawlStore from '../.././stores/crawlStore'
import HeritrixJobItem from './heritrixJobItem'
import styles from '../styles/styles'
import shallowCompare from 'react-addons-shallow-compare'

const {
  crawlUrlS,
  statusS,
  timestampS,
  discoveredS,
  queuedS,
  downloadedS,
  actionS
} = styles.heritrixTable

export default class HeritrixJobList extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      jobs: CrawlStore.jobs()
    }
  }

  @autobind
  getJobs () {
    // console.log('Get jobs crawlstore')
    this.setState({ jobs: CrawlStore.jobs() })
  }

  componentWillMount () {
    CrawlStore.on('jobs-updated', this.getJobs)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('jobs-updated', this.getJobs)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let { jobs } = this.state
    let JobItems
    if (jobs.length > 0) {
      JobItems = jobs.map(job => <HeritrixJobItem key={job.jobId} {...job} />)
    } else {
      JobItems = (
        <TableRow key='no-items-tr'>
          <TableRowColumn style={crawlUrlS}>
            No Jobs
          </TableRowColumn>
          <TableRowColumn style={statusS}>
            To Display
          </TableRowColumn>
          <TableRowColumn style={timestampS}>
            0
          </TableRowColumn>
          <TableRowColumn style={discoveredS}>
            0
          </TableRowColumn>
          <TableRowColumn style={queuedS}>
            0
          </TableRowColumn>
          <TableRowColumn style={downloadedS}>
            0
          </TableRowColumn>
          <TableRowColumn style={actionS}>
            No actions available
          </TableRowColumn>
        </TableRow>
      )
    }
    return (
      <div style={{ height: '80%' }}>
        <Table
          height={400}
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
            {JobItems}
          </TableBody>
        </Table>
      </div>

    )
  }

  // render () {
  //   // console.log('rendering the joblist', this.state)
  //   let { jobs } = this.state
  //   let JobItems
  //   if (jobs.length > 0) {
  //     JobItems = []
  //     let len = jobs.length
  //     let stopAddingDividers = len - 1
  //     for (let i = 0; i < len; ++i) {
  //       let job = jobs[ i ]
  //       JobItems.push(<HeritrixJobItem key={job.jobId} {...job} />)
  //       if (i < stopAddingDividers) {
  //         JobItems.push(<Divider key={`${job.jobId}-${i}`}/>)
  //       }
  //     }
  //   } else {
  //     JobItems = <ListItem primaryText='No Jobs To Display'/>
  //   }
  //   return (
  //     <List style={styles.heritrixJobList}>
  //       {JobItems}
  //     </List>
  //   )
  // }
}
