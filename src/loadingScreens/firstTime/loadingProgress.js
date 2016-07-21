import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Grid, Row} from 'react-cellblock'
import {List} from 'material-ui/List'
import autobind from 'autobind-decorator'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import CheckOS from './checkOS'
import CheckJava from './checkJava'
import styles from '../../componets/styles/styles'

const progressMessages = [
  'Checking Operating System',
  'Checking Java Version',
]

const baseTheme = getMuiTheme(lightBaseTheme)

export default class LoadingProgress extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super()
    this.state = {
      statusMessage: progressMessages[ 0 ],
      messageCounter: 0,
      muiTheme: baseTheme,
      javaCheckDone: false,
      serviceCheck: false,
    }
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }


  @autobind
  javaCheck (have, which) {
    console.log(have, which)
  }


  render () {
    return (
      <Grid flexible={true}>
        <Row>
          <Table key={'os-check-table'}>
            <TableHeader
              key={'os-check-table-header'}
              displaySelectAll={false}
              adjustForCheckbox={false}
              style={styles.tableHeader}
            >
              <TableRow key={'os-check-table-header-tablerow'} displayBorder={false}>
                <TableHeaderColumn key={'os-check-table-header-thc-os'} style={styles.tableHeaderCol}>
                  Check
                </TableHeaderColumn>
                <TableHeaderColumn key={'os-check-table-header-thc-complete'} style={styles.tableHeaderCol}>
                  Progress
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              key={'os-check-table-body'}
              displayRowCheckbox={false}
              showRowHover={true}
            >
              <CheckOS />
              <CheckJava checkJava={this.javaCheck}/>
            </TableBody>
          </Table>
        </Row>
        <Row>
          <p>{this.state.statusMessage}</p>
        </Row>
      </Grid>
    )
  }
}
