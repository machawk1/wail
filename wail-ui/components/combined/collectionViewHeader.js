import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import {Flex, Item} from 'react-flex'
import moment from 'moment'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import Search from 'material-ui/svg-icons/action/search'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import SortDirection from './sortDirection'
import SortHeader from './sortHeader'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link, IndexLink} from 'react-router'

const stateToProps = (state, ownProps) => {
  let collection = state.get('collections').get(ownProps.viewingCol)
  return {
    created: collection.get('created'),
    lastUpdated: collection.get('lastUpdated'),
    size: collection.get('size'),
    seeds: collection.get('seeds').size,
    description: collection.get('metadata').get('description')
  }
}

export default class CollectionViewHeader extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  render () {
    let col = this.props.collection
    let viewingCol = col.get('colName')
    let description = col.get('metadata').get('description')
    let { primary1Color } = this.context.muiTheme.baseTheme.palette
    let title = <span><IndexLink to='/'
      style={{
        color: primary1Color,
        textDecoration: 'none'
      }}>Collections</IndexLink> > {viewingCol}</span>
    return (
      <div>
        <Flex row alignItems='baseline' justifyContent='space-between'>
          <CardTitle title={title} />
          <CardTitle subtitle={`Last Updated: ${col.get('lastUpdated').format('MMM DD YYYY')}`} />
          <CardTitle subtitle={`Created: ${col.get('created').format('MMM DD YYYY')}`} />
          <CardTitle subtitle={`Seeds: ${col.get('seeds').size}`} />
          <CardTitle subtitle={`Size: ${col.get('size')}`} />
        </Flex>
        <Card>
          <CardText>
            {description}
          </CardText>
        </Card>
      </div>
    )
  }
}

