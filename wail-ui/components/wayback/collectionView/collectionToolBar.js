import React, {Component, PropTypes} from 'react'
import {CardActions} from 'material-ui/Card'
import {Grid, Row, Col} from 'react-flexbox-grid'
import ActionButton from 'material-ui/RaisedButton'
import {remote} from 'electron'
import cp from 'child_process'
import S from 'string'
import autobind from 'autobind-decorator'
import GMessageDispatcher from '../../../dispatchers/globalMessageDispatcher'
import {openUrlInBrowser, openFSLocation} from '../../../actions/util-actions'
import wailConstants from '../../../constants/wail-constants'
import CollectionStore from '../../../stores/collectionStore'
import WarcToCollection from '../collectionView/warcToCollection'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes

export default class CollectionToolBar extends Component {
  static propTypes = {
    currCollection: PropTypes.string.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log(this.props, nextProps)
    return this.props.currCollection !== nextProps.currCollection
  }

  @autobind
  forceIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col: this.props.currCollection }), opts, (error, stdout, stderr) => {
      if (error) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Error',
            level: 'error',
            message: `There was an error in indexing ${this.props.currCollection}!`,
            uid: `There was an error in force indexing ${this.props.currCollection}!`
          }
        })
        console.error(error)
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Success',
            level: 'success',
            message: `Indexing of collection ${this.props.currCollection} finished`,
            uid: `Indexing of collection ${this.props.currCollection} finished`
          }
        })
      }
      console.log(stderr)
      console.log(stdout)
    })
  }

  render () {
    let {
      archive,
      colName,
      indexes,
    } = CollectionStore.getCollection(this.props.currCollection)
    return (
      <CardActions>
        <Grid fluid>
          <Row between="xs">
            <Col>
              <ActionButton
                label='Open Index Location'
                onTouchTap={() => openFSLocation(indexes)}
              />
            </Col>
            <Col>
              <ActionButton
                label='Open Warc Location'
                onTouchTap={() => openFSLocation(archive)}
              />
            </Col>
            <Col>
              <ActionButton
                label='View In Wayback'
                onTouchTap={() => openUrlInBrowser(`${settings.get('pywb.url')}${colName}`)}
              />
            </Col>
            <Col>
              <ActionButton
                label='Reindex'
                onTouchTap={() => this.forceIndex()}
              />
            </Col>
            <Col>
              <WarcToCollection />
            </Col>
          </Row>
        </Grid>
      </CardActions>
    )
  }

}
