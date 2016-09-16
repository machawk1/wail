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


const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const defaultCol = process.env.NODE_ENV === 'development' ? 'Wail' : 'default'

export default class WayBackTab extends Component {
  constructor (props, context) {
    super(props, context)
    let colNames = []
    let collections = {}
    for (let [cname, collection] of ColStore.collections) {
      colNames.push(cname)
      collections[ cname ] = collection
    }
    this.state = {
      loading: true,
      collections,
      colNames
    }
  }

  componentWillMount () {
    ColStore.on('got-all-collections', this.getCollections)
    ColStore.on('added-new-collection', this.getCollections)
    ColStore.on('updated-col', this.getUpdate)
  }

  componentWillUnmount () {
    ColStore.removeListener('got-all-collections', this.getCollections)
    ColStore.removeListener('added-new-collection', this.getCollections)
    ColStore.removeListener('updated-col', this.getUpdate)
  }

  @autobind
  getCollections (cols) {
    let { collections, colNames } = this.state
    console.log(cols)
    cols.forEach(col => {
      colNames.push(col.colName)
      collections[ col.colName ] = col
    })
    this.setState({ collections, colNames })
  }

  @autobind
  getUpdate (updated) {
    let { collections } = this.state
    collections[updated.colName] = updated
    this.setState({collections})
  }

  @autobind
  forIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col: 'Wail' }), opts, (error, stdout, stderr) => {
      if (error) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Error',
            level: 'error',
            message: `There was an error in force indexing! ${stderr}`,
            uid: `There was an error in force indexing! ${stderr}`
          }
        })
        console.error(error)
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Success',
            level: 'success',
            message: stdout,
            uid: stdout
          }
        })
      }
      console.log(stderr)
      console.log(stdout)
    })
  }

  render () {
    console.log('wayback default col is',defaultCol)
    return (
      <Grid
        fluid
        className='waybackGrid'
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
    )
  }
}
/*
 <ToolbarGroup lastChild={true}>
 <RaisedButton
 label='Edit Configuration'
 labelPosition='before'
 icon={<EditIcon/>}
 onMouseDown={() => shell.openItem(settings.get('wayBackConf'))}
 />
 </ToolbarGroup>
 */
