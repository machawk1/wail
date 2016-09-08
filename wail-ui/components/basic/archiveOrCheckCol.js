import React, { Component, PropTypes } from 'react'
import Paper from 'material-ui/Paper'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import CollectionStore from '../../stores/collectionStore'
import ColDispatcher from '../../dispatchers/collectionDispatcher'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'
import ArchivalButtons from './archivalButtos'
import ArchiveUrl from './archive-url'
import BasicColList from './basicCollectionList'
import ViewWatcher from '../../../wail-core/util/viewWatcher'

const from = 'archiveOrCheckCols'

export default class ArchiveOrCheckCol extends Component {



  constructor (...args) {
    super(...args)
    console.log(CollectionStore)
    let maybeNames = CollectionStore.getColNames()
    console.log(maybeNames)
    this.state = {
      colNames: maybeNames.length > 0 ? maybeNames : [ 'Wail' ],
      viewing: 'Wail'
    }
  }

  componentWillMount () {
    CollectionStore.on('got-all-collections', ::this.gotAllNames)
    ViewWatcher.on(`${from}-view`, viewMe => {
      this.setState({ viewing: viewMe })
    })
  }

  componentWillUnmount () {
    CollectionStore.removeListener('got-all-collections', ::this.gotAllNames)
    ViewWatcher.removeListener(`${from}-view`)
  }

  gotAllNames (cols) {
    console.log('got allNames archive or checkCol',cols)
    this.setState({
      colNames: cols.map(c => c.colName)
    })
  }

  render () {
    return (
      <Card style={{width: '100%'}}>
        <CardHeader
          title="Archive URL Or Check Existence In A Collection"
          subtitle="Single Page Crawl"
        />
        <Grid fluid>
          <Row>
            <Col xs>
              <ArchiveUrl forCol={this.state.viewing}/>
            </Col>
          </Row>
          <Row>
            <Col xs>
              <ArchivalButtons
              archiveList={
                <BasicColList
                  cols={this.state.colNames}
                  viewWatcher={ViewWatcher}
                  from={from}
                />
              }
              />
            </Col>
          </Row>
        </Grid>
      </Card>
    )
  }

}