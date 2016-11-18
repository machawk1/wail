import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import FlatButton from 'material-ui/FlatButton'
import Add from 'material-ui/svg-icons/content/add'
import MyAutoSizer from './myAutoSizer'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import SortDirection from './sortDirection'
import SortHeader from './sortHeader'
import Divider from 'material-ui/Divider'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import CollectionViewHeader from './collectionViewHeader'
import {shell, remote} from 'electron'
import './table.css'

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

const runsForCol = (state, col) => {
  if (col.get('seeds').size > 0) {
    return Immutable.Map(col.get('seeds').reduce((acum, seed) => {
      if (seed.get('jobIds').size > 1) {
        let latest = Math.max(...seed.get('jobIds').values())
        acum[ seed.get('url') ] = state.get('crawls').get(`${latest}`)
        return acum
      }
      acum[ seed.get('url') ] = state.get('crawls').get(`${seed.get('jobIds').get(0)}`)
      return acum
    }, {}))
  } else {
    return Immutable.Map()
  }
}

const stateToProps = (state, ownProps) => {
  let collection = state.get('collections').get(ownProps.params.col)
  let crawlInfo = runsForCol(state, collection)
  return {
    collection,
    viewingCol: ownProps.params.col,
    crawlInfo
  }
}

const wbUrl = remote.getGlobal('settings').get('pywb.url')
const openInWb = (seed, forCol) => shell.openExternal(`${wbUrl}${forCol}/*/${seed}`)

@connect(stateToProps)
export default class CollectionView extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired,
    crawlInfo: PropTypes.instanceOf(Immutable.Map).isRequired,
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      sortDirection: null,
      sortKey: 'null'
    }
  }

  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('colview combined should component update')
  //   return shallowCompare(this, nextProps, nextState)
  // }

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
    for (let i = 0; i < len; ++i) {
      let seed = seeds.get(i)
      let url = seed.get('url')
      let runInfo = this.props.crawlInfo.get(url)
      trs.push(<TableRow key={`${i}-${url}`}>
        <TableRowColumn key={`${i}-${url}-seed-url`}>
          {url}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-added`}>
          {runInfo.get('created').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-lastArchived`}>
          {runInfo.get('lastUpdated').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-size`}>
          {seed.get('mementos')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-viewInWB`}>
          <FlatButton label={'View'} onTouchTap={() => openInWb(url, this.props.viewingCol)}/>
        </TableRowColumn>
      </TableRow>)
    }
    return trs
  }

  setSortDirection (sortKey, sortDirection) {
    this.setState({ sortDirection, sortKey })
  }

  render () {
    let sdirection = this.state.sortDirection || SortDirection.ASC
    let trs = this.renTr()
    return (
      <div style={{ width: '100%', height: '100%' }} id='collViewDiv'>
        <CollectionViewHeader collection={this.props.collection}/>
        <Divider />
        <div style={{ height: 'inherit' }}>
          <MyAutoSizer findElement='collViewDiv'>
            {({ height }) => (
              <Table height={`${height - 130}px`}>
                <TableHeader
                  displaySelectAll={false}
                  adjustForCheckbox={false}
                >
                  <TableRow >
                    <SortHeader
                      key='SortHeader-name' text='Seed Url'
                      sortDirection={sdirection}
                      onTouchTap={::this.setSortDirection}
                    />
                    <TableHeaderColumn>Added</TableHeaderColumn>
                    <TableHeaderColumn>Last Archived</TableHeaderColumn>
                    <TableHeaderColumn>Mementos</TableHeaderColumn>
                    <TableHeaderColumn />
                  </TableRow>
                </TableHeader>
                <TableBody
                  displayRowCheckbox={false}
                  showRowHover
                >
                  {trs}
                </TableBody>
              </Table>
            )}
          </MyAutoSizer>
        </div>
        <Link to={`/Collections/${this.props.viewingCol}/addSeed`}>
          <FloatingActionButton
            style={{
              right: 0,
              position: 'fixed',
              bottom: 5
            }}
          >
            <Add />
          </FloatingActionButton>
        </Link>
      </div>
    )
  }
}

