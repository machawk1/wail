import React, { Component, PropTypes } from "react"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from "material-ui/Table"
import HeritrixJobInfoRow from './heritrixJobInfoRow'

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

  constructor (props, context) {
    super(props, context)
  }
   

  render () {
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
         <HeritrixJobInfoRow />
        </TableBody>
      </Table>
    )
  }
}


