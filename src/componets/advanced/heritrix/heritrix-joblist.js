import React, {Component} from 'react'
import {List, ListItem} from 'material-ui/List'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import Divider from 'material-ui/Divider'
import autobind from 'autobind-decorator'
import CrawlStore from '../.././../stores/crawlStore'
import HeritrixJobItem from './heritrixJobItem'
import styles from '../../styles/styles'

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
    let JobItems
    if (jobs.length > 0) {
      JobItems = jobs.map(job => <HeritrixJobItem key={job.jobId} {...job} />)
    } else {
      // JobItems = <ListItem primaryText='No Jobs To Display'/>
      JobItems = (
        <TableRow key="no-items-tr">
          <TableRowColumn>
            No Jobs
          </TableRowColumn>
          <TableRowColumn>
            To Display
          </TableRowColumn>
          <TableRowColumn>
            0
          </TableRowColumn>
          <TableRowColumn>
            0
          </TableRowColumn>
          <TableRowColumn>
            0
          </TableRowColumn>
          <TableRowColumn>
            0
          </TableRowColumn>
          <TableRowColumn>
            No actions available
          </TableRowColumn>
        </TableRow>
      )
    }
    return (
      <Table height={'140'} width={"100%"}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow >
            <TableHeaderColumn>
              Crawl Url(s)
            </TableHeaderColumn>
            <TableHeaderColumn>
              Status
            </TableHeaderColumn>
            <TableHeaderColumn>
              Timestamp
            </TableHeaderColumn>
            <TableHeaderColumn>
              Discovered
            </TableHeaderColumn>
            <TableHeaderColumn>
              Queued
            </TableHeaderColumn>
            <TableHeaderColumn>
              Downloaded
            </TableHeaderColumn>
            <TableHeaderColumn>
              Actions
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover={true}
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
