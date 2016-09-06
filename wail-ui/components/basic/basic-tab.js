import React, {Component} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import ArchiveUrl from './archive-url'
import BasicTabButtons from './basicTab-buttons'
import MementoTable from './mementoTable'
import ArchivalButtons from './archivalButtos'
import MementoMessagePanel from './mementoMessage-panel'
import BasicColList from './basicCollectionList'
import styles from '../styles/styles'

const { btBody } = styles.basicTab

// <MementoMessagePanel />
/*
 <div style={{width: '50%'}}>
 <BasicColList />
 </div>
 <div style={{width: '50%'}}>
 <ArchiveUrl />
 </div>
 <Row>
 <Col xs>
 <ArchivalButtons />
 </Col>
 </Row>
 <Row>
 <Col xs>
 <BasicTabButtons />
 </Col>
 </Row>
 */
export default class BasicTab extends Component {
  render () {
    return (
      <Grid fluid className="layOutGrid">
        <Row >
          <Col xs>
            <BasicColList />
          </Col>
          <Col xs>
            <ArchiveUrl />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <ArchivalButtons />
          </Col>
        </Row>
      </Grid>
    )
  }
}

/*
 <div style={btBody}>
 <ArchiveUrl />
 <ArchivalButtons />
 <MementoMessagePanel />
 <BasicTabButtons />
 </div>

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

