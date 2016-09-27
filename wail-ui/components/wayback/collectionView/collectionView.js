import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import {Grid, Row, Col} from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import {createSelector} from 'reselect'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import Badge from 'material-ui/Badge'
import {remote} from 'electron'
import wailConstants from '../../../constants/wail-constants'
import CollectionMetadata from './collectionMetadata'
import {CardMedia, CardText, CardTitle} from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import InfoIcon from 'material-ui/svg-icons/action/info-outline'
import NumArchives from '../collectionHeader/numArchives'
const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const metadataTransform = (mdata) => {
  let tmdata = {}
  mdata.forEach(md => {
    tmdata[ md.k ] = md.v
  })
  return tmdata
}

const makeState = (colName) => {
  return CollectionStore.getCollection(this.props.viewingCol)
}

export default class CollectionView extends Component {

  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      theCol: CollectionStore.getCollection(this.props.viewingCol)
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log('collection view cwrp',this.props,nextProps)
    if (this.props.viewingCol !== nextProps.viewingCol) {
      let theCol =  CollectionStore.getCollection(nextProps.viewingCol)
      console.log(theCol)
      this.setState({ theCol})
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    console.log(this.context)
    let {
      archive,
      colName,
      colpath,
      indexes,
      numArchives,
      metadata,
      name
    } = this.state.theCol
    let tmdata = metadataTransform(metadata)

    return (
      <div style={{ marginTop: '10px' }}>
        <CardMedia>
          <Grid fluid>
            <Row between="xs">
              {
                tmdata[ 'title' ] &&
                <Col xs>
                  <p>{`Title: ${tmdata[ 'title' ]}`}</p>
                </Col>
              }
              {
                tmdata[ 'description' ] &&
                <Col xs>
                  <p>{`Description: ${tmdata[ 'description' ]}`}</p>
                </Col>
              }
              <Col xs>
                <NumArchives viewingCol={this.props.viewingCol}/>
              </Col>
            </Row>
          </Grid>
        </CardMedia>
      </div>
    )
  }
}
/*
 <span
 data-tip='Drag drop archives to add or click the plus button'
 data-delay-show='100'
 style={{cursor: 'help'}}
 >
 {`Archives in collection: ${numArchives}`}
 </span>
 <IconButton tooltip={'Drag drop archives to add or click the plus button'} tooltipPosition='top-center'>
 <InfoIcon/>
 </IconButton>
 */
/*
 <Row middle="xs">
 <Col xs>
 <CollectionMetadata metadata={metadata}/>
 </Col>
 </Row>
 */
