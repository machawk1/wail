import React, { Component, PropTypes } from 'react'
import { Card, CardHeader, CardTitle, CardText, CardActions } from 'material-ui/Card'
import { Flex, Item } from 'react-flex'
import { openFSLocation } from '../../../actions/util-actions'
import autobind from 'autobind-decorator'
import CollectionStore from '../../../stores/collectionStore'
import Edit from 'material-ui/svg-icons/editor/mode-edit'
import IconButton from 'material-ui/IconButton'
import ColDispatcher from '../../../dispatchers/collectionDispatcher'
import CrawlStore from '../../../stores/crawlStore'
import FlatButton from 'material-ui/FlatButton'
import Container from 'muicss/lib/react/container'
import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react'
import Divider from 'material-ui/Divider'
import ReactTooltip from 'react-tooltip'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'
import shallowCompare from 'react-addons-shallow-compare'
import NumArchives from '../collectionHeader/numArchives'

export default class CollectionInfo extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    let { colName, numArchives, metadata, indexes, archive } = CollectionStore.getCollection(this.context.viewingCol)
    this.state = {
      colName, numArchives, metadata, indexes, archive,
      uniqueSeeds: CollectionStore.getUniqueSeeds(this.context.viewingCol).length,
      totalCrawls: CrawlStore.getCrawlsForCol(this.context.viewingCol).length
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log('colInfo should component update')
    return shallowCompare(this, nextProps, nextState)
  }

  componentWillMount () {
    CrawlStore.on('jobs-updated', this.checkShouldUpdate)
    // this.emit(`updated-${update.forCol}-metadata`,col.metadata)
    CollectionStore.on(`updated-${this.context.viewingCol}-metadata`, this.updateMetadata)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('jobs-updated', this.checkShouldUpdate)
    CollectionStore.removeListener(`updated-${this.context.viewingCol}-metadata`, this.updateMetadata)
  }

  @autobind
  updateMetadata (metadata) {
    this.setState({ metadata })
  }

  @autobind
  checkShouldUpdate () {
    let allCrawls = CrawlStore.getCrawlsForCol(this.context.viewingCol)
    if (this.state.totalCrawls !== allCrawls.length) {
      this.setState({
        uniqueSeeds: CollectionStore.getUniqueSeeds(this.context.viewingCol).length,
        totalCrawls: allCrawls.length
      })
    }
  }

  openWarcLoc () {
    openFSLocation(this.state.archive)
  }

  render () {
    console.log('colInfo')
    return (
      <Container>
        <div style={{
          margin: 'auto',
          width: '100%',
          padding: '20px'
        }}>
          <Card>
            <CardTitle
              title={this.state.metadata[ 'title' ]}
              children={<IconButton onTouchTap={() => ViewWatcher.editMdata({
                forCol: this.context.viewingCol,
                title: this.state.metadata[ 'title' ],
                description: this.state.metadata[ 'description' ]
              })}
                style={{ float: 'right', bottom: '40px' }}
              >
                <Edit />
              </IconButton>}
            />
            <CardText>
              {this.state.metadata[ 'description' ]}
            </CardText>
            <Divider />
            <CardHeader title='Collection Data' />
            <CardText>
              <Flex row alignItems='center'>
                <Item> <CardTitle subtitle={`Seeds: ${this.state.uniqueSeeds}`} /></Item>
                <Item> <CardTitle subtitle={`Crawls: ${this.state.totalCrawls}`} /></Item>
                <Item><NumArchives viewingCol={this.state.colName} numArchives={this.state.numArchives} /></Item>
              </Flex>
            </CardText>
            <CardActions>
              <FlatButton primary label='Open (W)arc Location' onTouchTap={() => openFSLocation(this.state.archive)} />
              <FlatButton primary label='Open Index Location' onTouchTap={() => openFSLocation(this.state.indexes)} />
            </CardActions>
          </Card>
        </div>
        <ReactTooltip />
      </Container>
    )
  }

}
/*
 children={
 <span>
 <IconButton
 style={{
 float: 'left',
 bottom: '45px',
 left: '40px',
 display: 'inline-block',
 position: 'relative'
 }}
 iconStyle={{ width: 20, height: 20 }}
 >
 <Edit />
 </IconButton>

 </span>
 }
 */
