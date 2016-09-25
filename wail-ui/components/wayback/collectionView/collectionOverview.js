import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import WarcToCollection from './warcToCollection'
import FitText from 'react-fittext'
import autobind from 'autobind-decorator'
import CollectionToolBar from './collectionToolBar'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import { remote } from 'electron'
import { openUrlInBrowser, openFSLocation } from '../../../actions/util-actions'

const settings = remote.getGlobal('settings')

export default class CollectionOverview extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  constructor (...args) {
    super(...args)
  }

  render () {
    let { collection } = this.props
    console.log(collection)
    let {
      archive,
      colName,
      colpath,
      indexes,
      numArchives,
      name
    } = collection
    return (
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
    )
  }

}
