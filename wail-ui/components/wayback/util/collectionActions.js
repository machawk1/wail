import React, {Component, PropTypes} from 'react'
import { Textfit } from 'react-textfit'
import autobind from 'autobind-decorator'
import cp from 'child_process'
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
    viewingCol: PropTypes.object.isRequired
  }


  constructor (...args) {
    super(...args)
    this.state = {
      opened: false
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
      title: `Add Warc Files To ${this.context.viewingCol.colName}`,
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
          forCol: this.context.viewingCol.colName,
          warcs: joinStrings(...addMe, { separator: ' ' })
        })
      }
    })
  }

  @autobind
  forceIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    let col = this.context.viewingCol.colName
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

  render () {
    let { primary1Color } = this.context.muiTheme.palette
    return (
      <Menu direction="horizontal" distance={-80}
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
          <RotatingAction />
        </span>
        <span>
          <IconButton
            tooltip='View In Wayback'
            tooltipPosition='top-center'
            onTouchTap={() => openUrlInBrowser(`${settings.get('pywb.url')}${this.context.viewingCol.colName}`)}
          >
            <OpenInBrowser/>
          </IconButton>
        </span>
        <span>
          <IconButton
            tooltip='Open Collection Location'
            tooltipPosition='top-center'
            onTouchTap={() => openFSLocation(this.context.viewingCol.colpath)}
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
            tooltip='Add (W)arcs'
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
