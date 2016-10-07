import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import { Textfit } from 'react-textfit'
import autobind from 'autobind-decorator'
import cp from 'child_process'
import Apps from 'material-ui/svg-icons/navigation/apps'
import S from 'string'
import path from 'path'
import {remote, ipcRenderer as ipc} from 'electron'
import Menu from 'react-motion-menu'
import IconButton from 'material-ui/IconButton'
import Add from 'material-ui/svg-icons/content/add'
import OpenCollection from 'material-ui/svg-icons/file/folder-open'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import Reindex from 'material-ui/svg-icons/action/cached'
import RotatingAction from './rotatingAction'
import shallowCompare from 'react-addons-shallow-compare'
import {joinStrings} from 'joinable'
import wailConstants from '../../../constants/wail-constants'
import * as notify from '../../../actions/notification-actions'
import {openUrlInBrowser, openFSLocation} from '../../../actions/util-actions'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'
const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const open = { transform: 'rotate(45deg)' }
const closed = {}

export default class CollectionActions extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    viewingCol: PropTypes.string.isRequired
  }


  constructor (...args) {
    super(...args)
    let viewingCol = CollectionStore.getCollection(this.context.viewingCol)
    this.menuRef = null
    let {colName, colpath} = viewingCol
    this.state = {
      opened: false,
      colName,
      colpath
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  @autobind
  addWarcs () {
    console.log('add Warcs')
    const { dialog } = remote
    let archiveChooserOpts = {
      title: `Add Warc Files To ${this.state.colName}`,
      defaultPath: remote.app.getPath('home'),
      properties: [ 'openFile', 'multiSelections' ],
      filters: [
        { name: 'Archives', extensions: [ 'warc', 'arc' ] }
      ]
    }
    dialog.showOpenDialog(remote.getCurrentWindow(), archiveChooserOpts, (files) => {
      if (files) {
        console.log(files)
        let addMe = []
        files.forEach(f => {
          if (S(path.extname(f)).isEmpty()) {
            addMe.push(f)
          } else {
            addMe.push(f)
          }
        })

        console.log(addMe)
        ipc.send('add-warcs-to-col', {
          forCol: this.state.colName,
          warcs: joinStrings(...addMe, { separator: ' ' })
        })
      }
    })
    this.menuRef.close()
  }

  @autobind
  forceIndex () {
    this.menuRef.close()
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    let col = this.state.colName
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col }), opts, (error, stdout, stderr) => {
      if (error) {
        notify.notify({
          title: 'Error',
          level: 'error',
          autoDismiss: 0,
          message: `There was an error in indexing ${col}!`,
          uid: `There was an error in force indexing ${col}!`,
          children: (
            <Textfit mode='multi'>
              {stdout}
            </Textfit>
          )
        })
        console.error(error)
        window.logger.error({
          err: error,
          indexing: col,
          stdout: stdout,
          stderr: stderr
        })
      } else {
        notify.notify({
          title: 'Success',
          level: 'success',
          children: (
            <Textfit mode='multi'>
              {stdout}
            </Textfit>
          ),
          message: `Indexing of collection ${col} finished`,
          uid: `Indexing of collection ${col} finished`
        })
        window.logger.info({
          indexing: col,
          stdout: stdout,
          stderr: stderr
        })
      }
      console.log(stderr)
      console.log(stdout)
    })
  }

  openInBrowser() {
    openUrlInBrowser(`${settings.get('pywb.url')}${this.state.colName}`)
    this.menuRef.close()
  }

  openColLoc() {
    openFSLocation(this.state.colpath)
    this.menuRef.close()
  }



  render () {
    let { primary1Color } = this.context.muiTheme.palette
    return (
      <Menu
        ref={r => this.menuRef = r}
        direction="horizontal" distance={-80}
            width={50} height={50} y={1} x={1}
            customClass='colActionMenu'
            customStyle={{
              color: primary1Color,
              textAlign: "center",
              lineHeight: "50px",
              backgroundColor: primary1Color,
              border: `solid 1px ${primary1Color}`,
              borderRadius: "50%"
            }}>
        <span>
          <IconButton
            tooltipPosition='top-center'
            tooltip='Actions'
          >
        <Apps/>
      </IconButton>
        </span>
        <span>
          <IconButton
            tooltip='View In Wayback'
            tooltipPosition='top-center'
            onTouchTap={::this.openInBrowser}
          >
            <OpenInBrowser/>
          </IconButton>
        </span>
        <span>
          <IconButton
            tooltip='Open Collection Location'
            tooltipPosition='top-center'
            onTouchTap={::this.openColLoc}
          >
            <OpenCollection/>
          </IconButton>
        </span>
        <span>
          <IconButton
            tooltip='Reindex Collection'
            tooltipPosition='top-center'
            onTouchTap={this.forceIndex}
          >
            <Reindex/>
          </IconButton>
        </span>
        <span>
          <IconButton
            tooltip='Add (W)ARCs'
            tooltipPosition='top-center'
            onTouchTap={this.addWarcs}
          >
            <Add />
          </IconButton>
        </span>
      </Menu>
    )
  }
}
