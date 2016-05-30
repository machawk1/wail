import React, {Component, PropTypes} from 'react'
import {Table, TableBody, TableHeader,
   TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import RaisedButton from 'material-ui/RaisedButton'


export default class General extends Component {
   constructor(props, context) {
      super(props, context)

      this.wayBackFix = this.wayBackFix.bind(this)
      this.wayBackKill = this.wayBackKill.bind(this)
      this.heritrixFix = this.heritrixFix.bind(this)
      this.heritrixKill = this.heritrixKill.bind(this)

   }

   wayBackFix(event){
      console.log("Wayback fix")
   }

   wayBackKill(event){
      console.log("Wayback Kill")
   }

   heritrixFix(event){
      console.log("Heritrix fix")
   }

   heritrixKill(event){
      console.log("Heritrix fix")
   }

   render() {
      return (
         <Table>
            <TableHeader
               displaySelectAll={false}
               adjustForCheckbox={false}
            >
               <TableRow>
                  <TableHeaderColumn>Service Status</TableHeaderColumn>
                  <TableHeaderColumn>State</TableHeaderColumn>
                  <TableHeaderColumn>Version</TableHeaderColumn>
                  <TableHeaderColumn/>
                  <TableHeaderColumn/>
               </TableRow>
            </TableHeader>
            <TableBody
               displayRowCheckbox={false}
               showRowHover={true}
            >
               <TableRow>
                  <TableRowColumn>Wayback</TableRowColumn>
                  <TableRowColumn>Ok</TableRowColumn>
                  <TableRowColumn>''</TableRowColumn>
                  <TableRowColumn><RaisedButton label="Fix"  onMouseDown={this.wayBackFix}/></TableRowColumn>
                  <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.wayBackKill}/></TableRowColumn>
               </TableRow>
               <TableRow>
                  <TableRowColumn>Heritrix</TableRowColumn>
                  <TableRowColumn>X</TableRowColumn>
                  <TableRowColumn>3.2.0</TableRowColumn>
                  <TableRowColumn><RaisedButton label="Fix"  onMouseDown={this.heritrixFix}/></TableRowColumn>
                  <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.heritrixKill}/></TableRowColumn>
               </TableRow>
            </TableBody>
         </Table>
      )
   }
}
