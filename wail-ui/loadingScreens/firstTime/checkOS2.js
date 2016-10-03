import React, {Component} from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import SvgIcon from 'material-ui/svg-icons/action/done'
import autobind from 'autobind-decorator'
import os from 'os'

export default class CheckOS extends Component {

  @autobind
  doCheck () {
    let plat = os.platform()
    return { os: plat, arch: os.arch() }
  }

  render () {
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
    )
  }
}
