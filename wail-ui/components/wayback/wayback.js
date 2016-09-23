import React, { Component } from 'react'
import { shell, remote } from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import { Grid, Row, Col } from 'react-flexbox-grid'
import GMessageDispatcher from '../../dispatchers/globalMessageDispatcher'
import OpenBrowserIcon from 'material-ui/svg-icons/action/open-in-browser'
import FolderOpen from 'material-ui/svg-icons/file/folder-open'
import cp from 'child_process'
import autobind from 'autobind-decorator'
import S from 'string'
import Explorer from './explorer'
import wailConstants from '../../constants/wail-constants'
import { ipcRenderer as ipc } from 'electron'
import _ from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import CollectionView from './collectionView'
import CollectionList from './collectionList'
import CollectionHeader from './collectionHeader'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import Dimensions from 'react-dimensions'
import ColStore from '../../stores/collectionStore'
import CollectionToolBar from './collectionView/collectionToolBar'
import WarcToCollection from './collectionView/warcToCollection'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import NewCollection from './collectionView/newCollection'

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const defaultCol = wailConstants.Default_Collection
/*
 <WarcToCollection colName={colName} className="wbCollectionOverviewRow">
 <div>
 <Row between='xs'>
 <Col xs>
 <p>Collection Name: {colName}</p>
 </Col>
 <Col xs>
 <Col xs>
 <p>Warcs in collection: {numArchives}</p>
 </Col>
 </Col>
 </Row>
 <Row between='xs'>
 <Col xs>
 <OpenButton label='View In Wayback'
 onTouchTap={() => openUrlInBrowser(`${settings.get('pywb.url')}${colName}`)}/>
 </Col>
 <Col xs>
 <OpenButton label='Open Index Location' onTouchTap={() => openFSLocation(indexes)}/>
 </Col>
 <Col xs>
 <OpenButton label='Open Warc Location' onTouchTap={() => openFSLocation(archive)}/>
 </Col>
 </Row>
 </div>
 </WarcToCollection>
 */

export default class WayBackTab extends Component {

  render () {
    console.log('wayback default col is', this.props)
    return (
      <div>
        <WarcToCollection colName={this.props.params.col} className="wbCollectionOverviewRow">

          <Grid
            fluid
          >
            <CollectionList />
            {this.props.children || <p>Select Collection To View</p>}
          </Grid>
        </WarcToCollection>
        <NewCollection />
      </div>
    )
  }
}
/*
 <Grid
 fluid
 >
 <CollectionList
 key='the-list'
 cols={this.state.colNames}
 viewWatcher={ViewWatcher}
 from='Wail-Archive-Collections'
 />
 <CollectionView
 collections={this.state.collections}
 viewWatcher={ViewWatcher}
 from='Wail-Archive-Collections'
 defaultView={defaultCol}
 />
 </Grid>
 <ToolbarGroup lastChild={true}>
 <RaisedButton
 label='Edit Configuration'
 labelPosition='before'
 icon={<EditIcon/>}
 onMouseDown={() => shell.openItem(settings.get('wayBackConf'))}
 />
 </ToolbarGroup>
 */
