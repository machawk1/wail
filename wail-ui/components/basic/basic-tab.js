import React, {Component, PropTypes} from 'react'
import {Card, CardActions, CardMedia} from 'material-ui/Card'
import BasicTabHeader from './basicTabHeader'
import ArchiveUrl from './archive-url'
import ArchivalButtons from './archivalButtos'
import Container from 'muicss/lib/react/container'
import shallowCompare from 'react-addons-shallow-compare'

export default class BasicTab extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <Container fluid>
        <div className="child">
          <Card>
            <BasicTabHeader/>
            <CardMedia>
              <ArchiveUrl />
            </CardMedia>
            <CardActions>
              <ArchivalButtons />
            </CardActions>
          </Card>
        </div>
      </Container>
    )
  }
}
/*

 <Container fluid>
 <div className="child">
 <Card>
 <BasicTabHeader/>
 <CardMedia>
 <ArchiveUrl />
 </CardMedia>
 <CardActions>
 <ArchivalButtons />
 </CardActions>
 </Card>
 </div>
 </Container>
 <Grid
 fluid
 >
 <Row top="xs">
 <Col xs>
 <CardHeader
 title='Archive URL'
 subtitle='Single Page Crawl'
 />
 </Col>
 </Row>
 <Row middle="xs">
 <Col xs>
 <ArchiveUrl />
 </Col>
 </Row>
 <Row bottom="xs">
 <Col xs>
 <ArchivalButtons />
 </Col>
 </Row>
 </Grid>
 */
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

