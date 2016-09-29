import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import autobind from 'autobind-decorator'
import {Grid, Row, Col} from 'react-flexbox-grid'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import {remote, ipcRenderer as ipc} from 'electron'
import wailConstants from '../../../constants/wail-constants'
import NumArchives from '../collectionHeader/numArchives'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import ReactTooltip from 'react-tooltip'
import {joinStrings} from 'joinable'
import Subheader from 'material-ui/Subheader'
import CollectionSearch from './collectionSearch'
// From https://github.com/oliviertassinari/react-swipeable-views

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

const startNewCrawl = () => ipc.send('open-newCrawl-window', CollectionStore.colNames)

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
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }
  static propTypes = {
    viewingCol: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderCrawls () {
    let crawls = CrawlStore.getCrawlsForCol(this.props.viewingCol)
    if (crawls.length === 0) {
      return <ListItem primaryText={'No Crawls For This Collection Start One?'} onTouchTap={startNewCrawl}/>
    } else {
      let renderMe = []
      let len = crawls.length
      for (let i = 0; i < len; ++i) {
        let aCrawl = crawls[ i ]
        console.log(aCrawl)
        if (Array.isArray(aCrawl.urls)) {
          let seeds = joinStrings(...aCrawl.urls, { separator: '\n' })
          let elem =
            <span key={`spane-${seeds}${this.props.viewingCol}${i}`} data-tip={seeds} data-class="wailToolTip">
              <ListItem key={`li-colCrawls-${seeds}${this.props.viewingCol}${i}`} primaryText={aCrawl.urls[ 0 ]}
                        secondaryText={`Multi Seed: ${aCrawl.urls.length}`}/>
            </span>
          renderMe.push(elem)
        } else {
          renderMe.push(<ListItem key={`li-colCrawls-${aCrawl.urls}${this.props.viewingCol}${i}`}
                                  primaryText={aCrawl.urls}/>)
        }

        if (i + 1 < len) {
          renderMe.push(<Divider key={`liDividerFor-${this.props.viewingCol}${i}`}/>)
        }
      }
      return renderMe
    }
  }

  render () {
    return (
      <List
        style={{
          minHeight: `${this.props.height / 1.4}px`,
          maxHeight: `${this.props.height / 1.4}px`,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <Subheader>Collection Seed List</Subheader>
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
    console.log('rendering overview')
    let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
    let tmdata = metadataTransform(viewingCol.metadata)
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
    let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
    let tmdata = metadataTransform(viewingCol.metadata)
    return (
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
