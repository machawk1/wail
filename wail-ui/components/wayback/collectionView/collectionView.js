import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import autobind from 'autobind-decorator'
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

export default class CollectionView extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.removeWarcAdder = null
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
    let viewingCol = CollectionStore.getCollection(this.props.params.col)
    let { name, colpath, archive, indexes, colName, numArchives, metadata,
      crawls, hasRunningCrawl } = viewingCol
    console.log(viewingCol)
    let { primary1Color } = this.context.muiTheme.palette
    console.log(primary1Color)
    return (
      <div id='warcUpload' style={{ width: '100%', height: '100%' }}>
        <Card>
          <CardTitle
            title={metadata['title']}
            children={<NumArchives viewingCol={this.props.params.col} numArchives={numArchives}/>}
          />
          <ReactTooltip/>
        </Card>
        <CollectionActions archive={archive} colName={this.props.params.col} indexes={indexes} />
      </div>
    )
  }
}
/*
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
