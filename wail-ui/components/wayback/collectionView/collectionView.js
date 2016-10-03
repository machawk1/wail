import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import CrawlStore from '../../../stores/crawlStore'
import {ipcRenderer as ipc, remote} from 'electron'
import path from 'path'
import {joinStrings} from 'joinable'
import BeamMeUpScotty from 'drag-drop'
import * as notify from '../../../actions/notification-actions'
import {memoize} from 'lodash'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import CollectionTabs from './collectionTabs'
import wailConstants from '../../../constants/wail-constants'
import CollectionActions from '../util/collectionActions'
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

export default class CollectionView extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  static childContextTypes = {
    viewingCol: PropTypes.object.isRequired,
    viewingColRuns: PropTypes.arrayOf(PropTypes.object).isRequired,
    uniqueSeeds:  PropTypes.object.isRequired,
    totalCrawls:  PropTypes.number.isRequired
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
    this.state = {
      slideIndex: 0,
    }
  }

  // @decorate(memoize)
  makeChildContext(col) {
    let viewingCol =  CollectionStore.getCollection(col)
    let viewingColRuns =  CrawlStore.getCrawlsForCol(col)
    let uniqueSeeds = new Set()
    let len = viewingColRuns.length
    let totalCrawls = 0
    for(let i = 0; i < len; ++i) {
      if(Array.isArray(viewingColRuns[i].urls)){
        viewingColRuns[i].urls.forEach(url => uniqueSeeds.add(url))
      } else {
        uniqueSeeds.add(viewingColRuns[i].urls)
      }
      totalCrawls += viewingColRuns[i].runs.length
    }
    return {
      viewingCol,
      viewingColRuns,
      uniqueSeeds,
      totalCrawls
    }
  }

  getChildContext () {
    console.log('collectionView getChildContext')
    return this.makeChildContext(this.props.params.col)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidMount () {
    if (!this.removeWarcAdder) {
      console.log('attaching warc adder on live dom')
      this.removeWarcAdder = BeamMeUpScotty('#warcUpload', (files) => {
        console.log(`adding warcs maybe to col ${this.props.params.col}`, files)
        let addMe = []
        let badFiles = new Set()

        files.forEach(f => {
          console.log(f)
          let ext = path.extname(f.path)
          if (ext === '.warc' || ext === '.arc') {
            addMe.push(f.path)
          } else {
            badFiles.add(ext)
          }
        })

        if (badFiles.size > 0) {
          notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...badFiles, { separator: ',' })}`)
        }

        if (addMe.length > 0) {
          notify.notifyInfo(`Adding ${addMe.length} ${path.extname(addMe[ 0 ])} Files`, true)
          ipc.send('add-warcs-to-col', {
            forCol: this.props.params.col,
            warcs: joinStrings(...addMe, { separator: ' ' })
          })
        }
      })
    } else {
      console.log('we mounted but already have the warc upload listener attached')
    }
  }

  componentWillUnmount () {
    this.removeWarcAdder()
    this.removeWarcAdder = null
  }

  render () {
    return (
      <div id='warcUpload' style={{ width: '100%', height: '100%' }}>
        <CollectionTabs />
        <CollectionActions />
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
