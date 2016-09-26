import React, {Component, PropTypes} from 'react'
import {CardActions} from 'material-ui/Card'
import {Grid, Row, Col} from 'react-flexbox-grid'
import ActionButton from 'material-ui/RaisedButton'
import {remote} from 'electron'
import cp from 'child_process'
import S from 'string'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
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
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    let {
      colName,
      indexes,
      archive,
    } = CollectionStore.getCollection(this.props.viewingCol)
    this.state = {
      colName,
      indexes,
      archive,
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    let shouldUpdate = shallowCompare(this, nextProps, nextState)
    console.log(this.props, nextProps, shouldUpdate)
    return shouldUpdate
  }

  componentWillReceiveProps (nextProps, nextContext) {
    if (this.props.viewingCol !== nextProps.viewingCol) {
      let {
        colName,
        indexes,
        archive,
      } = CollectionStore.getCollection(this.props.viewingCol)
      this.setState({ colName, indexes, archive })
    }
  }

  @autobind
  forceIndex () {
    let opts = {
      cwd: settings.get('warcs')
      // stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    let col = this.state.colName
    // prevIndexingDone = false
    // generatePathIndex(generateCDX)
    cp.exec(S(settings.get('pywb.reindexCol')).template({ col }), opts, (error, stdout, stderr) => {
      if (error) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Error',
            level: 'error',
            autoDismiss: 0,
            message: `There was an error in indexing ${col}!`,
            uid: `There was an error in force indexing ${col}!`,
            children: (
              <div>
                <p>
                  {stderr}
                </p>
                <p>
                  {stdout}
                </p>
              </div>
            )
          }
        })
        console.error(error)
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Success',
            level: 'success',
            children: (
              <div>
                <p>
                  {stderr}
                </p>
                <p>
                  {stdout}
                </p>
              </div>
            ),
            message: `Indexing of collection ${col} finished`,
            uid: `Indexing of collection ${col} finished`
          }
        })
      }
      window.logger.info({
        indexing: col,
        stdout: stdout,
        stderr: stderr
      })
      console.log(stderr)
      console.log(stdout)
    })
  }

  render () {
    return (
      <div className="layoutFooter">
        <CardActions>
          <Grid fluid>
            <Row between="xs">
              <Col>
                <ActionButton
                  label='Open Index Location'
                  onTouchTap={() => openFSLocation(this.state.indexes)}
                />
              </Col>
              <Col>
                <ActionButton
                  label='Open Warc Location'
                  onTouchTap={() => openFSLocation(this.state.archive)}
                />
              </Col>
              <Col>
                <ActionButton
                  label='View In Wayback'
                  onTouchTap={() => openUrlInBrowser(`${settings.get('pywb.url')}${this.state.colName}`)}
                />
              </Col>
              <Col>
                <ActionButton
                  label='Reindex'
                  onTouchTap={() => this.forceIndex()}
                />
              </Col>
            </Row>
          </Grid>
        </CardActions>
      </div>
    )
  }

}
