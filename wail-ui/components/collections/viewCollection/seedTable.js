import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {shell, remote} from 'electron'
import FlatButton from 'material-ui/FlatButton'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import SortDirection from '../../sortDirection/sortDirection'
import SortHeader from '../../sortDirection/sortHeader'
import { momentSortRev} from '../../../util/momentSort'

const wbUrl = remote.getGlobal('settings').get('pywb.url')
const openInWb = (seed, forCol) => shell.openExternal(`${wbUrl}${forCol}/*/${seed}`)

export default class SeedTable extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      sortDirection: null,
      sortKey: ''
    }
  }

  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('colview combined should component update')
  //   return shallowCompare(this, nextProps, nextState)
  // }

  renTr () {
    let viewingCol = this.props.collection.get('colName')
    let trs = []
    let seeds = this.props.collection.get('seeds').sort((s1,s2) => momentSortRev(s1.get('added'),s2.get('added')))
    let len = seeds.size
    for (let i = 0; i < len; ++i) {
      let seed = seeds.get(i)
      let url = seed.get('url')
      trs.push(<TableRow key={`${i}-${url}`}>
        <TableRowColumn key={`${i}-${url}-seed-url`}>
          {url}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-added`}>
          {seed.get('added').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-lastArchived`}>
          {seed.get('lastUpdated').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-size`}>
          {seed.get('mementos')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-viewInWB`}>
          <FlatButton label={'View'} onTouchTap={() => openInWb(url, viewingCol)} />
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
              >
                {trs}
              </TableBody>
            </Table>
          )}
        </MyAutoSizer>
      </div>
    )
  }
}

