import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/FlatButton'
import WarcToCollection from './warcToCollection'
import FitText from 'react-fittext'
import Dimensions from 'react-dimensions'
import autobind from 'autobind-decorator'

export default class CollectionOverview extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
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
      <Grid fluid>
        <Row between="xs">
          <Col>
            <h3>Collection Name:   {colName}</h3>
          </Col>
          <Col>
            <h3>Warcs in collection: {numArchives}</h3>
          </Col>
        </Row>
        <Row between="xs">
          <Col>
            <h3>Warc Location: {archive}</h3>
          </Col>
          <Col>
            <OpenButton label="Open Location" />
          </Col>
        </Row>
        <Row between="xs">
          <Col>
            <h3>Index Location: {indexes}</h3>
          </Col>
          <Col>
            <OpenButton label="Open Location" />
          </Col>
        </Row>
        <Row>
          <WarcToCollection />
        </Row>
      </Grid>
    )
  }

}