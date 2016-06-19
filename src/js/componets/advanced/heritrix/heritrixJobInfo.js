import React, {Component, PropTypes} from "react"
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from "material-ui/Table"
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
         runs.sort((j1, j2) => {
            if (j1.ended)
               return j1.endedOn.isBefore(j2.ended ? j2.endedOn : j2.timestamp)
            else
               return j1.timestamp.isBefore(j2.ended ? j2.endedOn : j2.timestamp)
         })
         return runs.map((job, idx) => {
            let status = job.ended ? "Ended" : "Running"
            let discovered = job.discovered || ''
            let queued = job.queued || ''
            let downloaded = job.downloaded || ''
            let tStamp = job.ended ? job.endedOn : job.timestamp
            return (
               <TableRow key={`${this.state.jobId}${count++}`} displayBorder={false}>
                  <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                     {status}
                  </TableRowColumn>
                  <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>
                     {tStamp.format("MM/DD/YYYY h:mm:ssa")}
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
         })
      } else {
         return (
            <TableRow key={`${this.state.jobId}${count++}`}>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>Not
                                                                                               Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>Not
                                                                                               Started</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
               <TableRowColumn key={`${this.state.jobId}${count++}`} style={style.tableRowCol}>0</TableRowColumn>
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
               style={style.tableHeader}
            >
               <TableRow displayBorder={false}>
                  <TableHeaderColumn style={style.tableHeaderCol}>Status</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableHeaderCol}>Timestamp</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableHeaderCol}>Discovered</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableHeaderCol}>Queued</TableHeaderColumn>
                  <TableHeaderColumn style={style.tableHeaderCol}>Downloaded</TableHeaderColumn>
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


