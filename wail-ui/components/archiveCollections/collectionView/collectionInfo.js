import React, {Component, PropTypes} from 'react'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import autobind from 'autobind-decorator'
import CollectionOverview from './collectionOverview'

export default class CollectionInfo extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
  }
  constructor(...args) {
    super(...args)
    this.state = {
      index: 0,
    }
  }

  @autobind
  handleChange(index)  {
    this.setState({index})
  }

  render () {
    let {collection} = this.props
    return (
      <div>
        <Tabs
          onChange={this.handleChange}
          value={this.state.index}
        >
          <Tab label="Overview" value={0} />
          <Tab label="Metadata" value={1} />
          <Tab label="Crawls" value={2} />
          <Tab label="Query Collection" value={3} />
        </Tabs>
        <SwipeableViews
          index={this.state.index}
          onChangeIndex={this.handleChange}
        >
          <CollectionOverview className="slide" collection={collection} />
          <div className="slide">
            Metadata
          </div>
          <div className="slide">
            Crawls
          </div>
          <div className="slide">
            Query
          </div>
        </SwipeableViews>
      </div>
    )
  }

}