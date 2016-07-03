import React, { Component } from "react"
import { List, ListItem } from "material-ui/List"
import autobind from "autobind-decorator"
import CrawlStore from "../.././../stores/crawlStore"
import HeritrixJobItem from "./heritrixJobItem"
import styles from "../../styles/styles"

export default class HeritrixJobList extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      jobs: CrawlStore.jobs(),
    }
  }

  @autobind
  getJobs () {
    console.log("Get jobs crawlstore")
    this.setState({ jobs: CrawlStore.jobs() })
  }

  componentWillMount () {
    CrawlStore.on('jobs-updated', this.getJobs)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('jobs-updated', this.getJobs)
  }

  render () {
    console.log('rendering the joblist', this.state)
    let { jobs } = this.state
    let JobItems = jobs.length > 0 ? jobs.map(job => <HeritrixJobItem key={job.jobId} {...job}/>) :
      <ListItem primaryText="No Jobs To Display"/>
    return (
      <List style ={styles.heritrixJobList}>
        {JobItems}
      </List>
    )
  }
}
