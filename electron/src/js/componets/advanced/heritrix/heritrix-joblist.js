import React, {Component} from "react";
import {List} from "material-ui/List";
import CrawlStore from "../.././../stores/crawlStore";
import HeritrixJobItem from "./heritrixJobItem";


export default class HeritrixJobList extends Component {

   constructor(props, context) {
      super(props, context)
      this.state = {
         jobs: CrawlStore.jobs(),
      }
      this.getJobs = this.getJobs.bind(this)
   }

   getJobs() {
      this.setState({jobs: CrawlStore.jobs()}) 
   }

   componentDidMount() {
      CrawlStore.on('job-created', this.getJobs)
   }

   componentWillUnmount() {
      CrawlStore.removeListener('job-created', this.getJobs)
   }

   render() {
      const {jobs} = this.state
      const JobItems = jobs.map(job => <HeritrixJobItem key={job.jobId} {...job}/>)
      return (
         <List>
            {JobItems}
         </List>
      )
   }
}
