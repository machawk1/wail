import React, {Component, PropTypes} from 'react'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {ListItem} from 'material-ui/List'
import SvgIcon from 'material-ui/svg-icons/action/done'
import autobind from 'autobind-decorator'
import os from 'os'

import styles from '../../componets/styles/styles'

export default class CheckOS extends Component {

  @autobind
  doCheck () {
    let plat = os.platform()
    return { os: plat, arch: os.arch() }
  }

  @autobind
  makeTable () {
    let { os, arch } = this.doCheck()
    let whichOS
    let bitType
    switch (os) {
      case 'darwin':
        whichOS = 'OSX'
        break
      case 'linux':
        whichOS = 'Linux'
        break
      case 'win':
        whichOS = 'Windows'
        break
    }

    switch (arch) {
      case 'x32':
        bitType = '32bit'
        break
      case 'x64':
        bitType = '64bit'
        break
    }

    return (
      <Table key={'os-check-table'}>
        <TableHeader
          key={'os-check-table-header'}
          displaySelectAll={false}
          adjustForCheckbox={false}
          style={styles.tableHeader}
        >
          <TableRow key={'os-check-table-header-tablerow'} displayBorder={false}>
            <TableHeaderColumn key={'os-check-table-header-thc-os'} style={styles.tableHeaderCol}>
              Operating System
            </TableHeaderColumn>
            <TableHeaderColumn key={'os-check-table-header-thc-complete'} style={styles.tableHeaderCol}>
              Complete
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          key={'os-check-table-body'}
          displayRowCheckbox={false}
          showRowHover={true}
        >
          <TableRow>
            <TableRowColumn>
              <p>
                Running {whichOS} {bitType}
              </p>
            </TableRowColumn>
            <TableRowColumn>
              <SvgIcon />
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  render () {
    return (
      <ListItem
        primaryText={this.makeTable()}
      />
    )
  }
}
