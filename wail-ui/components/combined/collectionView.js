import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import {Flex, Item} from 'react-flex'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import Search from 'material-ui/svg-icons/action/search'
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card'
import SortDirection from './sortDirection'
import SortHeader from './sortHeader'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import Divider from 'material-ui/Divider'
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import CollectionViewHeader from './collectionViewHeader'


const fuzzyFilter = (searchText, key) => {
  const compareString = key.toLowerCase()
  searchText = searchText.toLowerCase()

  let searchTextIndex = 0
  for (let index = 0; index < key.length; index++) {
    if (compareString[ index ] === searchText[ searchTextIndex ]) {
      searchTextIndex += 1
    }
  }

  return searchTextIndex === searchText.length
}


@connect((state, ownProps) => ({
  collection: state.get('collections').get(ownProps.params.col),
  viewingCol: ownProps.params.col
}))
export default class CollectionView extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired,
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  renTr () {
    let trs = []
    let seeds
    if (this.state.sortDirection) {
      seeds = this.props.collection.get('seeds')
        .filter(aSeed => fuzzyFilter(this.state.searchText, aSeed.get('url')))
        .sortBy(aSeed => aSeed.get('url').toLowerCase())
        .update(list => this.state.sortDirection === SortDirection.DESC ? list.reverse() : list)
    } else {
      seeds = this.props.collection.get('seeds').filter(aSeed => fuzzyFilter(this.state.searchText, aSeed.get('url')))
    }
    let len = seeds.size
    let { primary1Color } = this.context.muiTheme.baseTheme.palette
    for (let i = 0; i < len; ++i) {
      let seed = seeds.get(i)
      let url = seed.get('url')
      trs.push(<TableRow key={`${i}-${url}`}>
        <TableRowColumn key={`${i}-${url}-seed-url`}>
          <Link to={`Collections/${url}`} style={{ color: primary1Color, textDecoration: 'none' }}>{url}</Link>
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-numSeeds`}>
          {seed.get('seeds').size}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-lastUpdated`}>
          {seed.get('lastUpdated').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-size`}>
          {seed.get('size')}
        </TableRowColumn>
      </TableRow>)
    }
    return trs
  }

  render () {
    console.log(this.props.collection.toJS())
    return (
      <div style={{ width: '100%', height: '100%', }}>
        <div>
          <CollectionViewHeader collection={this.props.collection}/>
        </div>
        <Divider/>
        <p>{JSON.stringify(this.props)}</p>
      </div>
    )
  }
}



