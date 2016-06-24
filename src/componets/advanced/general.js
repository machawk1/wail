import React, {Component} from "react"
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from "material-ui/Table"
import RaisedButton from "material-ui/RaisedButton"
import {launchHeritrix, killHeritrix} from "../../actions/heritrix-actions"
import {startWayback, killWayback} from "../../actions/wayback-actions"
import ServiceStore from "../../stores/serviceStore"


export default class General extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {
         wbGood: false,
         hGood: false,
      }

      this.wayBackFix = this.wayBackFix.bind(this)
      this.wayBackKill = this.wayBackKill.bind(this)
      this.heritrixFix = this.heritrixFix.bind(this)
      this.heritrixKill = this.heritrixKill.bind(this)
      this.updateWaybackStatus = this.updateWaybackStatus.bind(this)
      this.updateHeritrixStatus = this.updateHeritrixStatus.bind(this)
      this.servicesUpdated = this.servicesUpdated.bind(this)
   }


   componentWillMount() {
      ServiceStore.on('heritrix-status-update', this.updateHeritrixStatus)
      ServiceStore.on('wayback-status-update', this.updateWaybackStatus)
      ServiceStore.on('monitor-status-update', this.servicesUpdated)
   }

   componentWillUnmount() {
      ServiceStore.removeListener('heritrix-status-update', this.updateHeritrixStatus)
      ServiceStore.removeListener('wayback-status-update', this.updateWaybackStatus)
      ServiceStore.removeListener('monitor-status-update', this.servicesUpdated)
   }

   servicesUpdated(){
      let status =  ServiceStore.serviceStatus
      this.setState({wbGood: status.wayback,hGood:status.heritrix})

   }

   updateWaybackStatus() {
      this.setState({wbGood: ServiceStore.waybackStatus()})
   }

   updateHeritrixStatus() {
      this.setState({hGood: ServiceStore.heritrixStatus()})
   }

   wayBackFix(event){
      console.log("Wayback fix")
      startWayback()
   }

   wayBackKill(event){
      console.log("Wayback Kill")
      killWayback()
   }

   heritrixFix(event){
      console.log(" Generalv HeritrixTab fix")
      launchHeritrix()
   }

   heritrixKill(event){
      console.log("General HeritrixTab Kill")
      killHeritrix()
   }

   render() {
      const waybackStatus = this.state.wbGood ? 'Running' : 'X'
      const heritrixStatus = this.state.hGood ? 'Running' : 'X'
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
                  <TableRowColumn>{waybackStatus}</TableRowColumn>
                  <TableRowColumn>''</TableRowColumn>
                  <TableRowColumn><RaisedButton label="Fix"  onMouseDown={this.wayBackFix}/></TableRowColumn>
                  <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.wayBackKill}/></TableRowColumn>
               </TableRow>
               <TableRow>
                  <TableRowColumn>Heritrix</TableRowColumn>
                  <TableRowColumn>{heritrixStatus}</TableRowColumn>
                  <TableRowColumn>3.2.0</TableRowColumn>
                  <TableRowColumn><RaisedButton label="Fix"  onMouseDown={this.heritrixFix}/></TableRowColumn>
                  <TableRowColumn><RaisedButton label="Kill" onMouseDown={this.heritrixKill}/></TableRowColumn>
               </TableRow>
            </TableBody>
         </Table>
      )
   }
}
