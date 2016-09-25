import React, { Component } from 'react'
import { List, ListItem } from 'material-ui/List'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import Divider from 'material-ui/Divider'
import autobind from 'autobind-decorator'
import CrawlStore from '../.././stores/crawlStore'
import HeritrixJobItem from './heritrixJobItem'
import styles from '../styles/styles'

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

  render () {
    // console.log('rendering the joblist', this.state)
    let { jobs } = this.state
    console.log(jobs)
    let JobItems
    if (jobs.length > 0) {
      JobItems = jobs.map(job => <HeritrixJobItem key={job.jobId} {...job} />)
    } else {
      // JobItems = <ListItem primaryText='No Jobs To Display'/>
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
      <Table
        height='375px'
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
