import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Map } from 'immutable'
import { BehaviorSubject } from 'rxjs'
import Flexbox from 'flexbox-react'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import CardText from 'material-ui/Card/CardText'
import CardTitle from 'material-ui/Card/CardTitle'
import SearchI from 'material-ui/svg-icons/action/search'
import SearchInput from '../../utilComponents/searchInput'

export default class CollectionViewHeader extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Map).isRequired,
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.collection !== nextProps.collection
  }

  render () {
    return (
      <Paper id='colViewHeader'>
        <Flexbox
          flexDirection='row'
          flexWrap='wrap'
          alignItems='baseline'
          justifyContent='space-between'
        >
          <CardTitle
            subtitle={`Last Archived: ${this.props.collection.get('lastUpdated').format('MMM DD, YYYY h:mma')}`} />
          <CardTitle subtitle={`Created: ${this.props.collection.get('created').format('MMM DD, YYYY h:mma')}`} />
          <CardTitle subtitle={`Seeds: ${this.props.collection.get('seeds').size}`} />
          <CardTitle subtitle={`Size: ${this.props.collection.get('size')}`} />
        </Flexbox>
        <CardText style={{padding: 0, paddingLeft: 64, paddingRight: 64}}>
          <span>
            <SearchInput hintText={'Search By URL'} searchSubject={this.props.filterText} />
          </span>
          <span>
            <IconButton tooltip={'Search Seeds By URL'}>
              <SearchI />
            </IconButton>
          </span>
        </CardText>
      </Paper>
    )
  }
}
