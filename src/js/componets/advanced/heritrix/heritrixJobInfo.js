import React, {Component, PropTypes} from "react"
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from "material-ui/Table"
import JobInfoDispatcher from '../../../dispatchers/jobInfoDispatcher'

export default class HeritrixJobInfo extends Component {

   constructor(props, context) {
      super(props, context)
      this.state = {
         jobId: '',
         path: '',
         runs: [],
      }
      this.viewingItem = this.viewingItem.bind(this)
      this.buildRows = this.buildRows.bind(this)
      JobInfoDispatcher.register(this.viewingItem)
   }

   viewingItem(clickedItem) {
      console.log("viewing job item")
      this.setState({
         jobId: clickedItem.state.jobId,
         path: clickedItem.state.path,
         runs: clickedItem.state.runs,
      })
   }

   buildRows() {
      let runs = this.state.runs
      let count = 0
      if (runs.length > 0) {
         return runs.map((job, idx) => {
            let status = job.ended ? "Ended" : "Running"
            return (
               <TableRow key={`${this.state.jobId}${count++}`}>
                  <TableRowColumn key={`${this.state.jobId}${count++}`}>{status}</TableRowColumn>
                  <TableRowColumn key={`${this.state.jobId}${count++}`} colSpan="2">{job.endedOn}</TableRowColumn>
                  <TableRowColumn key={`${this.state.jobId}${count++}`}
                                  style={{textAlign: 'center'}}>{job.discovered.trim()}</TableRowColumn>
                  <TableRowColumn key={`${this.state.jobId}${count++}`}>{job.queued.trim()}</TableRowColumn>
                  <TableRowColumn key={`${this.state.jobId}${count++}`}>{job.downloaded.trim()}</TableRowColumn>
               </TableRow>
            )
         })
      } else {
         return (
            <TableRow key={`${this.state.jobId}${count++}`}>
               <TableRowColumn key={`${this.state.jobId}${count++}`}>Not Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`}>Not Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`}>0</TableRowColumn>
            </TableRow>
         )

      }
   }


   render() {
      let rows = this.buildRows()
      return (
         <Table height={'300px'}>
            <TableHeader
               displaySelectAll={false}
               adjustForCheckbox={false}
            >
               <TableRow displayBorder={false}>
                  <TableHeaderColumn >Run Status</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Timestamp</TableHeaderColumn>
                  <TableHeaderColumn >Discovered</TableHeaderColumn>
                  <TableHeaderColumn >Queued</TableHeaderColumn>
                  <TableHeaderColumn >Downloaded</TableHeaderColumn>
               </TableRow>
            </TableHeader>
            <TableBody
               displayRowCheckbox={false}
               showRowHover={true}
            >
               {rows}
            </TableBody>
         </Table>
      )
   }
}


