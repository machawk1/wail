import React, { Component } from 'react'
import { Grid, Row } from 'react-cellblock'
import ArchiveUrl from './archive-url'
import BasicTabButtons from './basicTab-buttons'
import MementoTable from './mementoTable'
import ArchivalButtons from './archivalButtos'
import MementoMessagePanel from './mementoMessage-panel'
import styles from '../styles/styles'

const { btBody } = styles.basicTab

// <MementoMessagePanel />
export default class BasicTab extends Component {
  render () {
    return (
      <div style={btBody}>
        <ArchiveUrl />
        <ArchivalButtons />
        <MementoMessagePanel />
        <BasicTabButtons />
      </div>
    )
  }
}

/*

 <div style={btBody}>
 <ArchiveUrl />
 <div style={{ paddingBottom: 25 }} />
 <MementoTable />
 </div>

 render () {
 return (
 <Grid flexible >
 <ArchiveUrl />
 <MementoTable />
 <Row>
 <div style={{ paddingBottom: 25 }} />
 </Row>
 <BasicTabButtons />
 </Grid>
 )
 }
 */

