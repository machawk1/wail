import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Container from 'muicss/lib/react/container'
import * as colors from 'material-ui/styles/colors'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import {ArchivalButtons, ArchiveUrl} from './archive'
import Divider from 'muicss/lib/react/divider'
import BasicCollectionList from './localCollections'

export default class BasicTab extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <Container fluid>
        <div className='basicMiddle'>
          <Card>
            <CardTitle
              title='Archive Page'
              subtitle='To Collection'
              children={<BasicCollectionList />}
            />

            <CardText>
              <ArchiveUrl />
            </CardText>
            <ArchivalButtons />
          </Card>
        </div>
      </Container>
    )
  }
}
/*
 style={{
 backgroundColor: muiTheme.palette.primary2Color
 }}
 style={{backgroundColor: colors.cyan500}}
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

