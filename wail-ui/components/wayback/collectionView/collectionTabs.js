import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import autobind from 'autobind-decorator'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import {ipcRenderer as ipc} from 'electron'
import path from 'path'
import {joinStrings} from 'joinable'
import BeamMeUpScotty from 'drag-drop'
import * as notify from '../../../actions/notification-actions'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import {Grid, Row, Col} from 'react-flexbox-grid'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import {remote} from 'electron'
import Menu from 'react-motion-menu'
import wailConstants from '../../../constants/wail-constants'
import NumArchives from '../collectionHeader/numArchives'
import ReactTooltip from 'react-tooltip'
import Home from 'material-ui/svg-icons/action/home'
import Apps from 'material-ui/svg-icons/navigation/apps'
import Adb from 'material-ui/svg-icons/notification/adb'
import CollectionActions from '../util/collectionActions'
import Plus from 'material-ui/svg-icons/content/add'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import IconButton from 'material-ui/IconButton'
import CollectionSearch from './collectionSearch'
import CollectionCrawls from './collectionCrawls'
// From https://github.com/oliviertassinari/react-swipeable-views

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

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

export default class CollectionTabs extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      slideIndex: 0,
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }


  @autobind
  handleChange(value) {
    this.setState({
      slideIndex: value,
    })
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label="Tab One" value={0} />
          <Tab label="Tab Two" value={1} />
          <Tab label="Tab Three" value={2} />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div>
            <h2 style={styles.headline}>Tabs with slide effect</h2>
            Swipe to see the next slide.<br />
          </div>
          <div style={styles.slide}>
            slide n°2
          </div>
          <div style={styles.slide}>
            slide n°3
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
/*
 <Card>
 <CardTitle
 title={metadata['title']}
 children={<NumArchives viewingCol={this.props.params.col} numArchives={numArchives}/>}
 />
 <ReactTooltip/>
 </Card>
 <Menu
 direction="horizontal"
 distance={80}
 width={50}
 height={50}
 y={100}
 x={100}
 customStyle={{
 color: primary1Color,
 textAlign: 'center',
 lineHeight: '60px',
 backgroundColor: primary1Color,
 border: `solid 1px ${primary1Color}`,
 borderRadius: '50%'
 }}>
 <div >
 <Apps onTouchTap={() => console.log('clicked')}/>
 </div>
 <Home />
 <Adb/>
 </Menu>
 let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
 let tmdata = metadataTransform(viewingCol.metadata)
 <div>
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
 <CollectionCrawls height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 <Col xs>
 <CollectionSearch height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 </Row>
 </Grid>
 <ReactTooltip/>
 </div>
 */
