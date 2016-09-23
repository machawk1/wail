import React, { Component, PropTypes } from 'react'
import CollectionStore from '../../../stores/collectionStore'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import S from 'string'
import GMessageDispatcher from '../../../dispatchers/globalMessageDispatcher'
import cp from 'child_process'
import autobind from 'autobind-decorator'
import { remote } from 'electron'
import wailConstants from '../../../constants/wail-constants'
import { openUrlInBrowser, openFSLocation } from '../../../actions/util-actions'
const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class CollectionView2 extends Component {

  @autobind
  forIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col: this.props.routeParams.col }), opts, (error, stdout, stderr) => {
      if (error) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Error',
            level: 'error',
            message: `There was an error in indexing ${this.props.routeParams.col}!`,
            uid: `There was an error in force indexing ${this.props.routeParams.col}!`
          }
        })
        console.error(error)
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Success',
            level: 'success',
            message: `Indexing of collection ${this.props.routeParams.col} finished`,
            uid: `Indexing of collection ${this.props.routeParams.col} finished`
          }
        })
      }
      console.log(stderr)
      console.log(stdout)
    })
  }


  render () {
    console.log(this.props)
    let {
      archive,
      colName,
      colpath,
      indexes,
      numArchives,
      name
    } = CollectionStore.getCollection(this.props.routeParams.col)
    return (
      <Row middle="xs">
        <Col xs>
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
              <OpenButton label='Open Index Location' onTouchTap={() => openFSLocation(indexes)}/>
            </Col>
            <Col xs>
              <OpenButton label='Open Warc Location' onTouchTap={() => openFSLocation(archive)}/>
            </Col>
            <Col xs>
              <OpenButton label='View In Wayback'
                          onTouchTap={() => openUrlInBrowser(`${settings.get('pywb.url')}${colName}`)}/>
            </Col>
            <Col xs>
              <OpenButton label='Reindex Collection'
                          onTouchTap={() => this.forIndex()}/>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}
