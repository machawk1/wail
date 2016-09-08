import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/FlatButton'
import WarcToCollection from './warcToCollection'
import FitText from 'react-fittext'
import autobind from 'autobind-decorator'
import {shell} from 'electron'
import Dimensions from 'react-dimensions'

const textSize = 15

@Dimensions()
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
      <Grid fluid>
        <Row between='xs'>
          <Col xs>
            <FitText maxFontSize={textSize} >
              <h3>Collection Name: {colName}</h3>
            </FitText>
          </Col>
          <Col xs>
            <FitText maxFontSize={textSize} >
              <h3>Warcs in collection: {numArchives}</h3>
            </FitText>
          </Col>
        </Row>
        <Row between='xs'>
          <Col xs>
            <FitText maxFontSize={textSize} >
              <h3>Warc Location: {archive}</h3>
            </FitText>
          </Col>
          <Col xs>
            <OpenButton label='Open Location' onTouchTap={() => shell.openItem(archive)}/>
          </Col>
        </Row>
        <Row between='xs'>
          <Col xs>
            <FitText maxFontSize={textSize} >
              <h3>Index Location: {indexes}</h3>
            </FitText>
          </Col>
          <Col xs>
            <OpenButton label='Open Location' onTouchTap={() => shell.openItem(indexes)}/>
          </Col>
        </Row>
        <Row>
          <Col xs>
            <WarcToCollection />
          </Col>
        </Row>
      </Grid>
    )
  }

}
