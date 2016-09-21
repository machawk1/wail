import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import WarcToCollection from './warcToCollection'
import FitText from 'react-fittext'
import autobind from 'autobind-decorator'
import CollectionToolBar from './collectionToolBar'
import { remote } from 'electron'
import { openUrlInBrowser, openFSLocation } from '../../../actions/util-actions'


const settings = remote.getGlobal('settings')

export default class CollectionView2 extends Component {

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
        </Col>
      </Row>
    )
  }
}
