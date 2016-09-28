import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import autobind from 'autobind-decorator'
import {Grid, Row, Col} from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import {createSelector} from 'reselect'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import Badge from 'material-ui/Badge'
import {remote} from 'electron'
import wailConstants from '../../../constants/wail-constants'
import CollectionMetadata from './collectionMetadata'
import {CardMedia, CardText, CardTitle} from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import NumArchives from '../collectionHeader/numArchives'
import {Tabs, Tab} from 'material-ui/Tabs'
import {List,ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views'
const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const metadataTransform = (mdata) => {
  if (mdata) {
    let tmdata = {}
    mdata.forEach(md => {
      tmdata[ md.k ] = md.v
    })
    return tmdata
  } else {
    return mdata
  }
}

const makeState = (colName) => {
  return CollectionStore.getCollection(this.props.viewingCol)
}

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
}

class CollectionCrawls extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  renderCrawls(){
    if (this.props.crawls.length === 0 ) {
      return  <ListItem primaryText={'No Crawls For This Collection Start One?'}/>
    } else {

    }
  }

  render () {
    return (
      <List>
        {this.renderCrawls()}
      </List>
    )
  }

}

class OverView extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
    console.log(viewingCol)
    let {
      archive,
      colName,
      colpath,
      crawls,
      indexes,
      numArchives,
      metadata,
      name
    } = viewingCol
    let tmdata = metadataTransform(metadata)
    CrawlStore.getCrawlsForCol('sdas')
    return (
      <Grid fluid>
        <Row between="xs">
          {
            tmdata[ 'title' ] &&
            <Col xs>
              <p>{`Title: ${tmdata[ 'title' ]}`}</p>
            </Col>
          }
          {
            tmdata[ 'description' ] &&
            <Col xs>
              <p>{`Description: ${tmdata[ 'description' ]}`}</p>
            </Col>
          }
          <Col xs>
            <NumArchives viewingCol={this.props.viewingCol}/>
          </Col>
        </Row>
        <Row>
          <Col xs>

          </Col>
        </Row>
      </Grid>
    )
  }
}

export default class CollectionView extends Component {

  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      slideIndex: 0
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log('collection view cwrp', this.props, nextProps)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  @autobind
  handleChange (value) {
    this.setState({
      slideIndex: value,
    })
  }

  render () {
    console.log(this.context)
    return (
      <CardMedia style={{ height: '100%' }}>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label="Overview" value={0}/>
          <Tab label="Query" value={1}/>
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div>
            <OverView viewingCol={this.props.viewingCol}/>
          </div>
          <div style={{ padding: 10 }}>
            slide n°2
          </div>
        </SwipeableViews>
      </CardMedia>
    )
  }
}
/*
 <Grid fluid>
 <Row between="xs">
 {
 tmdata[ 'title' ] &&
 <Col xs>
 <p>{`Title: ${tmdata[ 'title' ]}`}</p>
 </Col>
 }
 {
 tmdata[ 'description' ] &&
 <Col xs>
 <p>{`Description: ${tmdata[ 'description' ]}`}</p>
 </Col>
 }
 <Col xs>
 <NumArchives viewingCol={this.props.viewingCol}/>
 </Col>
 </Row>
 </Grid>
 */
/*
 <span
 data-tip='Drag drop archives to add or click the plus button'
 data-delay-show='100'
 style={{cursor: 'help'}}
 >
 {`Archives in collection: ${numArchives}`}
 </span>
 <IconButton tooltip={'Drag drop archives to add or click the plus button'} tooltipPosition='top-center'>
 <InfoIcon/>
 </IconButton>
 */
/*
 <Row middle="xs">
 <Col xs>
 <CollectionMetadata metadata={metadata}/>
 </Col>
 </Row>
 */
