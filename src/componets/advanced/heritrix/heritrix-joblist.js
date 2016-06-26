import React, {Component} from "react"
import {List, ListItem} from "material-ui/List"
import CrawlStore from "../.././../stores/crawlStore"
import HeritrixJobItem from "./heritrixJobItem"


export default class HeritrixJobList extends Component {

   constructor(props, context) {
      super(props, context)
      this.state = {
         jobs: CrawlStore.jobs(),
      }
      this.getJobs = this.getJobs.bind(this)
    
   }

   getJobs() {
      console.log("Get jobs crawlstore")
      this.setState({ jobs: CrawlStore.jobs() })
   }

   componentWillMount() {
      CrawlStore.on('jobs-restored', this.getJobs)
      CrawlStore.on('job-created', this.getJobs)
   }

   componentWillUnmount() {
      CrawlStore.removeListener('jobs-restored', this.getJobs)
      CrawlStore.removeListener('job-created', this.getJobs)
   }

   render() {
      console.log('rendering the joblist',this.state)
      let {jobs} = this.state
      let JobItems = jobs.length > 0 ? jobs.map(job => <HeritrixJobItem key={job.jobId} {...job}/>) :
         <ListItem primaryText="No Jobs To Display"/>
      return (
         <List>
            {JobItems}
         </List>
      )
   }
}
