import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import autobind from 'autobind-decorator'
import { Row, Column } from 'react-cellblock'
import RaisedButton from 'material-ui/RaisedButton'
import { List, ListItem } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import MemgatorStore from '../../stores/memgatorStore'
import ArchiveNowButton from 'material-ui/svg-icons/content/archive'
import wailConstants from '../../constants/wail-constants'
import styles from '../styles/styles'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes
const { mementoTable } = styles.basicTab

let focusTime = null

export default class MementoTable extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { mementos: MemgatorStore.getMementos() }
  }

  componentWillMount () {
    MemgatorStore.on('added-url', this.getMementos)
  }

  componentWillUnmount () {
    MemgatorStore.removeListener('added-url', this.getMementos)
  }

  @autobind
  getMementos () {
    this.setState({ mementos: MemgatorStore.getMementos() })
  }

  render () {
    return (
      <Table
        height={mementoTable.height}
        fixedHeader={true}
      >
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn style={mementoTable.resourceCol}>
              Resource
            </TableHeaderColumn>
            <TableHeaderColumn style={mementoTable.copiesCol}>
              Public Copies
            </TableHeaderColumn>
            <TableHeaderColumn>
              Archival Status
            </TableHeaderColumn>
            <TableHeaderColumn>
              Actions
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover={true}
        >
          {this.state.mementos}
        </TableBody>
      </Table>
    )
  }
}
