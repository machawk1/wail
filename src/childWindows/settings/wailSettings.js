import React, {Component, PropTypes} from 'react'
import {ipcRenderer, remote} from 'electron'
import autobind from 'autobind-decorator'
import {Tab} from 'material-ui/Tabs'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow} from 'material-ui/Table'
import {List, ListItem} from 'material-ui/List'
import FSLocationChooser from './fsLocationChooser'
import styles from '../../componets/styles/styles'

// {[ 'cdx', 'warcs' ].map(it => <FSLocationChooser key={`fslc${it}`} whichSetting={it} warnOnChange={true} settings={settings}/>)}

export default class WailSettings extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired
  }
  /*
   [ 'cdx', 'warcs' ].map(it => <FSLocationChooser key={`fslc${it}`} whichSetting={it} warnOnChange={true}
   settings={this.props.settings}/>)
   */
  render () {
    let items = [ 'cdx', 'warcs' ].map(it => <FSLocationChooser key={`fslc${it}`} whichSetting={it} warnOnChange={true}
                                                                settings={this.props.settings}/>)
    return (
       {...items}
    )
  }
}
/*
 <div style={this.props.slideStyle}>
 <Table>
 <TableHeader
 displaySelectAll={false}
 adjustForCheckbox={false}
 >
 <TableRow>
 <TableHeaderColumn style={styles.settingsCol}>
 Setting
 </TableHeaderColumn>
 <TableHeaderColumn >
 Value
 </TableHeaderColumn>
 <TableHeaderColumn style={styles.settingsActionCol}>
 Action
 </TableHeaderColumn>
 </TableRow>
 </TableHeader>
 <TableBody
 displayRowCheckbox={false}
 showRowHover={true}
 >
 {[ 'cdx', 'warcs' ].map(it => <FSLocationChooser key={`fslc${it}`} whichSetting={it} warnOnChange={true} settings={settings}/>)}
 </TableBody>
 </Table>
 </div>
 */