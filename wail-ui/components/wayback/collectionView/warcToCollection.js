import React, { Component, PropTypes } from 'react'
import BeamMeUpScotty from 'drag-drop'
import {remote, ipcRenderer as ipc} from 'electron'
import * as notify from '../../../actions/notification-actions'
import path from 'path'
import { joinStrings } from 'joinable'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import S from 'string'

S.TMPL_CLOSE = '}'
S.TMPL_OPEN = '{'


export default class WarcToCollection extends Component {
  static propTypes = {
    currCollection: PropTypes.string,
  }


  addWarcs () {
    console.log('add Warcs')
    const {dialog} = remote
    let archiveChooserOpts = {
      title: `Add Warc Files To ${this.props.currCollection}`,
      defaultPath: remote.app.getPath('home'),
      properties: ['openFile','openDirectory', 'multiSelections'],
      filters: [
        {name: 'Archives', extensions: ['warc']}
      ]
    }
    console.log(archiveChooserOpts)
    dialog.showOpenDialog(remote.getCurrentWindow(),archiveChooserOpts,(files) => {
      if (files) {
        console.log(files)
        let addMe = []
        files.forEach(f => {
          if (S(path.extname(f)).isEmpty()) {
            addMe.push(path.join(f,'*.warc'))
          } else {
            addMe.push(f)
          }
        })

        console.log(addMe)
        ipc.send('add-warcs-to-col',{
          forCol: this.props.currCollection,
          warcs: joinStrings(...addMe, {separator: ' '})
        })
      }
    })
  }


  render () {
    return (
     <RaisedButton label='Add Warcs' onTouchTap={::this.addWarcs}/>
    )
  }

}
