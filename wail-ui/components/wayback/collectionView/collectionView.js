import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import {Grid, Row, Col} from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import S from 'string'
import GMessageDispatcher from '../../../dispatchers/globalMessageDispatcher'
import cp from 'child_process'
import autobind from 'autobind-decorator'
import {remote} from 'electron'
import wailConstants from '../../../constants/wail-constants'
import CollectionMetadata from './collectionMetadata'
import {CardTitle} from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class CollectionView extends Component {

  static propTypes = {
    currCollection: PropTypes.string.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log(this.props, nextProps)
    return this.props.currCollection !== nextProps.currCollection
  }

  render () {
    console.log(this.props)
    let {
      archive,
      colName,
      colpath,
      indexes,
      numArchives,
      metadata,
      name
    } = CollectionStore.getCollection(this.props.currCollection)
    return (
      <Grid fluid>
        <Row top="xs">
          <Col xs>
            {`Archives in collection: ${numArchives}`}
            <IconButton tooltip={'Drag drop archives to add or click the plus button'}>
              <InfoIcon/>
            </IconButton>
          </Col>
        </Row>
        <Row middle="xs">
          <Col xs>
            <CollectionMetadata metadata={metadata}/>
          </Col>
        </Row>
      </Grid>
    )
  }
}
