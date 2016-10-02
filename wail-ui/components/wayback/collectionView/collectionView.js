import React, {Component, PropTypes} from 'react'
import CollectionStore from '../../../stores/collectionStore'
import autobind from 'autobind-decorator'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import {Grid, Row, Col} from 'react-flexbox-grid'
import S from 'string'
import shallowCompare from 'react-addons-shallow-compare'
import {remote} from 'electron'
import wailConstants from '../../../constants/wail-constants'
import NumArchives from '../collectionHeader/numArchives'
import ReactTooltip from 'react-tooltip'
import CollectionSearch from './collectionSearch'
import CollectionCrawls from './collectionCrawls'
// From https://github.com/oliviertassinari/react-swipeable-views

const EventTypes = wailConstants.EventTypes

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const metadataTransform = (mdata) => {
  if (mdata) {
    let tmdata = {}
    mdata.forEach(md => {
      tmdata[ md.k ] = md.v
    })
    return tmdata
  } else {
    return mdata
  }
}

export default class CollectionView extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let viewingCol = CollectionStore.getCollection(this.props.params.col)
    console.log(viewingCol)
    return (
      <Card>
        <CardTitle
          title={`Collection: ${viewingCol.colName}`}
          children={<NumArchives viewingCol={this.props.params.col}/>}
        />
        <ReactTooltip/>
      </Card>
    )
  }
}
/*
 let viewingCol = CollectionStore.getCollection(this.props.viewingCol)
 let tmdata = metadataTransform(viewingCol.metadata)
 <div>
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
 <Row>
 <Col xs>
 <CollectionCrawls height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 <Col xs>
 <CollectionSearch height={this.props.height} viewingCol={this.props.viewingCol}/>
 </Col>
 </Row>
 </Grid>
 <ReactTooltip/>
 </div>
 */
