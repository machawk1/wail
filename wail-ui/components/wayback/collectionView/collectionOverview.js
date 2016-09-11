import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/RaisedButton'
import WarcToCollection from './warcToCollection'
import FitText from 'react-fittext'
import autobind from 'autobind-decorator'
import CollectionToolBar from './collectionToolBar'
import { shell } from 'electron'

const textSize = 15

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
      <Grid fluid className='waybackGrid'>
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

                <OpenButton label='Open Index Location' onTouchTap={() => shell.openItem(indexes)} />

          </Col>
          <Col xs>

                <OpenButton label='Open Warc Location' onTouchTap={() => shell.openItem(archive)} />

          </Col>
        </Row>
        <WarcToCollection colName={colName} />
      </Grid>
    )
  }

}
