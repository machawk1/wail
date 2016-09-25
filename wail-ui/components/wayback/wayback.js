import React, {Component} from 'react'
import {shell, remote} from 'electron'
import S from 'string'
import BeamMeUpScotty from 'drag-drop'
import {ipcRenderer as ipc} from 'electron'
import path from 'path'
import {joinStrings} from 'joinable'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import wailConstants from '../../constants/wail-constants'
import CollectionList from './collectionList'
import {CollectionView, CollectionToolBar} from './collectionView'
import * as notify from '../../actions/notification-actions'

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class WayBackTab extends Component {
  componentDidMount () {
    BeamMeUpScotty('#warcUpload', files => {
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
          forCol: this.props.currCollection,
          warcs: joinStrings(...addMe, { separator: ' ' })
        })
      }
    })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log(this.props.params.col !== nextProps.params.col)
    console.log(nextState, nextContext)
    console.log(this.props, nextProps)
    return this.props.params.col !== nextProps.params.col
  }

  render () {
    console.log('wayback col is', this.props)
    window.lastWaybackPath = this.props.params.col
    return (
      <div id='warcUpload' className="wbCollectionOverviewRow">
        <Card style={{ height: '100%' }}>
          <CardHeader
            title='Collections'
            subtitle={`Viewing ${this.props.params.col}`}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable>
            <CollectionList currCollection={this.props.params.col}/>
          </CardText>
          <CardMedia>
            <CollectionView currCollection={this.props.params.col}/>
          </CardMedia>
          <CollectionToolBar currCollection={this.props.params.col}/>
        </Card>
      </div>
    )
  }
}
