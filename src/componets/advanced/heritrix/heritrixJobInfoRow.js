import React, { Component} from "react"
import {  TableRow, TableRowColumn } from "material-ui/Table"
import autobind from "autobind-decorator"
import moment from 'moment'
import JobInfoDispatcher from '../../../dispatchers/jobInfoDispatcher'

const style = {
   tableHeaderCol: {
      paddingLeft: "12px",
      paddingRight: "12px",
   },
   tableHeader: {
      borderBottomStyle: "none"
   },
   tableRowCol: {
      paddingLeft: "12px",
      paddingRight: "12px",
      wordWrap: "break-word",
      textOverflow: "none",
      whiteSpace: "normal",
   }

}

export default class HeritrixJobInfoRow extends Component {
   
   constructor (props, context) {
      super(props, context)
      this.state = {
         jobId: '',
         path: '',
         runs: [],
      }
      JobInfoDispatcher.register(this.viewingItem)
   }
  
  @autobind
   viewingItem (clickedItem) {
      console.log("viewing job item", clickedItem)
      this.setState({
         jobId: clickedItem.state.jobId,
         path: clickedItem.state.path,
         runs: clickedItem.state.runs,
      })
   }
   
   render () {
      let runs = this.state.runs
      let count = 0
      if (runs.length > 0) {
         let job = runs[ 0 ]
         let status = job.ended ? "Ended" : "Running"
         let discovered = job.discovered || ''
         let queued = job.queued || ''
         let downloaded = job.downloaded || ''
         console.log('the job being displayed', job)
         return (
            <TableRow key={`${this.state.jobId}${count++}`} displayBorder={false}>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                  {status}
               </TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                  {moment(job.timestamp).format("MM/DD/YYYY h:mm:ssa")}
               </TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                  {discovered.trim()}
               </TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                  {queued.trim()}
               </TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                  {downloaded.trim()}
               </TableRowColumn>
            </TableRow>
         )

      } else {
         return (
            <TableRow key={`${this.state.jobId}${count++}`}>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>Not Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>Not
                                                                                               Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
            </TableRow>
         )

      }
   }
}


