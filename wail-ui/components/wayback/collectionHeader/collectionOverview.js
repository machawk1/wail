import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {remote} from 'electron'
import NumArchives from './numArchives'

export default class CollectionOverview extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  render () {
    let { collection } = this.props
    console.log(collection)
    return (
      <Grid fluid>
        <Row>
          <Col xs>
            <p>{`Title: ${metadata[ 'title' ]}`}</p>
          </Col>
          <Col xs>
            <NumArchives archiveCount={this.props.numArchives}/>
          </Col>
        </Row>
      </Grid>
    )
  }

}
