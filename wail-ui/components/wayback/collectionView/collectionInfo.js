import React, { Component, PropTypes } from 'react'
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import autobind from 'autobind-decorator'
import Dimensions from 'react-dimensions'
import { Row, Col } from 'react-flexbox-grid'
import CollectionOverview from './collectionOverview'
import CollectionMetadata from './collectionMetadata'


@Dimensions()
export default class CollectionInfo extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      index: 0
    }
  }

  @autobind
  handleChange (index) {
    this.setState({ index })
  }

  render () {
    let { collection } = this.props
    return (
      <Row>
        <Col xs>
          <Tabs
            onChange={this.handleChange}
            value={this.state.index}
          >
            <Tab label='Overview' value={0}/>

            <Tab label='Query Collection' value={1}/>
          </Tabs>
          <SwipeableViews
            index={this.state.index}
            onChangeIndex={this.handleChange}
          >
            <CollectionOverview collection={collection}/>
            <div >
              Query
            </div>
          </SwipeableViews>
        </Col>
      </Row>
    )
  }

}
