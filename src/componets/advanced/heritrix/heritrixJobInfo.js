import React, { Component, PropTypes } from "react"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from "material-ui/Table"
import HeritrixJobInfoRow from './heritrixJobInfoRow'
import styles from "../../styles/styles"

export default class HeritrixJobInfo extends Component {
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    runs: PropTypes.array.isRequired,
  }
  
  constructor (props, context) {
    super(props, context)
  }
   

  render () {
    return (
      <Table key={`${this.props.jobId}-Table`} height={'50px'} width={"100%"}>
        <TableHeader
          key={`${this.props.jobId}-TableHeader`}
          displaySelectAll={false}
          adjustForCheckbox={false}
          style={styles.tableHeader}
        >
          <TableRow key={`${this.props.jobId}-TableRow`} displayBorder={false}>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColJID`}  style={styles.tableHeaderCol}>
              Job Id
            </TableHeaderColumn>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColStatus`} style={styles.tableHeaderCol}>
              Status
            </TableHeaderColumn>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColTstamp`} style={styles.tableHeaderCol}>
              Timestamp
            </TableHeaderColumn>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColDiscov`} style={styles.tableHeaderCol}>
              Discovered
            </TableHeaderColumn>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColQue`} style={styles.tableHeaderCol}>
              Queued
            </TableHeaderColumn>
            <TableHeaderColumn key={`${this.props.jobId}-TableHColDL`} style={styles.tableHeaderCol}>
              Downloaded
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          key={`${this.props.jobId}-TableBody`}
          displayRowCheckbox={false}
          showRowHover={true}
        >
         <HeritrixJobInfoRow key={ `${this.props.jobId}-HJobInfoRow` } {...this.props}/>
        </TableBody>
      </Table>
    )
  }
}


