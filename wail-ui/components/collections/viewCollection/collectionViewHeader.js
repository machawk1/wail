import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Map } from 'immutable'
import { BehaviorSubject } from 'rxjs'
import { Flex } from 'react-flex'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import SearchI from 'material-ui/svg-icons/action/search'
import SearchInput from '../../utilComponents/searchInput'
import { CardTitle, CardText } from 'material-ui/Card'

export default class CollectionViewHeader extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collection: PropTypes.instanceOf(Map).isRequired,
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.collection !== nextProps.collection
  }

  render () {
    return (
      <Paper>
        <Flex row alignItems='baseline' justifyContent='space-between'>
          <CardTitle subtitle={`Last Updated: ${this.props.collection.get('lastUpdated').format('MMM DD YYYY')}`}/>
          <CardTitle subtitle={`Created: ${this.props.collection.get('created').format('MMM DD YYYY')}`}/>
          <CardTitle subtitle={`Seeds: ${this.props.collection.get('seeds').size}`}/>
          <CardTitle subtitle={`Size: ${this.props.collection.get('size')}`}/>
        </Flex>
        <CardText style={{padding: 0, paddingLeft: 64, paddingRight: 64}}>
           <span>
            <SearchInput hintText={'Search By URL'} searchSubject={this.props.filterText}/>
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

