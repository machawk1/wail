import React, {Component, PropTypes} from 'react'
import {shell, remote} from 'electron'
import S from 'string'
import BeamMeUpScotty from 'drag-drop'
import {ipcRenderer as ipc} from 'electron'
import path from 'path'
import {joinStrings} from 'joinable'
import CollectionStore from '../../stores/collectionStore'
import wailConstants from '../../constants/wail-constants'
import CollectionList from './collectionList'
import CollectionCard from './collectionHeader/collectionCard'
import {CollectionView, CollectionToolBar} from './collectionView'

import * as notify from '../../actions/notification-actions'

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class WayBackTab extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args){
    super(...args)
    this.removeWarcAdder = null
  }

  componentDidMount () {
    if (!this.removeWarcAdder) {
      console.log('attaching warc adder on live dom')
      this.removeWarcAdder = BeamMeUpScotty('#warcUpload', (files) => {
        console.log(`adding warcs maybe to col ${this.props.params.col}`,files)
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

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log(this.props.params.col !== nextProps.params.col)
    console.log(nextState, nextContext)
    console.log(this.props, nextProps)
    return this.props.params.col !== nextProps.params.col
  }

  addWarcs(files) {
    console.log('adding warcs maybe',files)
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
  }

  render () {
    console.log('wayback col is', this.props.params.col)

    window.lastWaybackPath = this.props.params.col
    return (
      <div
        id='warcUpload' className="wbCollectionOverviewRow"
        onDrop={(...args) => console.log('manual on drop event',...args)}
      >
        <CollectionCard viewingCol={this.props.params.col}>
          <CollectionView viewingCol={this.props.params.col}/>
          <CollectionToolBar
            viewingCol={this.props.params.col}
          />
        </CollectionCard>

      </div>
    )
  }
}
