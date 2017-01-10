import React, { Component, PropTypes } from 'react'
import Immutable from 'immutable'
import { shell, remote } from 'electron'
import FlatButton from 'material-ui/FlatButton'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { push } from 'react-router-redux'
import wc from '../../../constants/wail-constants'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import { momentSortRev } from '../../../util/momentSort'
import { List } from 'react-virtualized'

const {QUEUE_MESSAGE} = wc.EventTypes
const wbUrl = remote.getGlobal('settings').get('pywb.url')
const openInWb = (seed, forCol) => shell.openExternal(`${wbUrl}${forCol}/*/${seed}`)

export default class SeedTable extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('colview combined should component update')
  //   return shallowCompare(this, nextProps, nextState)
  // }

  viewArchiveConfig () {
    let col = this.props.collection.get('colName')
    if (this.props.collection.get('seeds').size > 0) {
      this.context.store.dispatch(push(`Collections/${col}/viewArchiveConfig`))
    } else {
      global.notifications$.next({
        type: QUEUE_MESSAGE,
        message: {
          autoDismiss: 0,
          title: 'No Seeds',
          level: 'warning',
          message: `Add Seeds to ${col} In Order To View Their Archive Config`,
          uid: `Add Seeds to ${col} In Order To View There Archive Config`
        }
      })
    }
  }

  renTr () {
    let viewingCol = this.props.collection.get('colName')
    let trs = []
    let seeds = this.props.collection.get('seeds').sort((s1, s2) => momentSortRev(s1.get('added'), s2.get('added')))
    let len = seeds.size
    for (let i = 0; i < len; ++i) {
      let seed = seeds.get(i)
      let url = seed.get('url')
      trs.push(<TableRow key={`${i}-${url}`}>
        <TableRowColumn key={`${i}-${url}-seed-url`} style={{paddingLeft: 10, paddingRight: 0, width: 300}}>
          {url}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-added`} style={{width: 130, paddingRight: 0}}>
          {seed.get('added').format('MMM DD, YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-lastArchived`} style={{width: 130, paddingRight: 20}}>
          {seed.get('lastUpdated').format('MMM DD, YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-size`} style={{width: 55}}>
          {seed.get('mementos')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-viewInWB`}>
          <FlatButton label={'View In Wayback'} onTouchTap={() => openInWb(url, viewingCol)} />
        </TableRowColumn>
      </TableRow>)
    }
    return trs
  }

  setSortDirection (sortKey, sortDirection) {
    this.setState({sortDirection, sortKey})
  }

  render () {
    let trs = this.renTr()
    return (
      <div style={{height: 'inherit'}}>
        <MyAutoSizer findElement='collViewDiv'>
          {({height}) => (
            <Table height={`${height - 130}px`}>
              <TableHeader
                selectable={false}
                displaySelectAll={false}
                adjustForCheckbox={false}
              >
                <TableRow >
                  <TableHeaderColumn style={{width: 270}}>Seed Url</TableHeaderColumn>
                  <TableHeaderColumn style={{width: 100}}>Added</TableHeaderColumn>
                  <TableHeaderColumn style={{width: 100}}>Last Archived</TableHeaderColumn>
                  <TableHeaderColumn style={{width: 55}}>Mementos</TableHeaderColumn>
                  <TableHeaderColumn>
                    <FlatButton
                      id='showArchiveConf'
                      label={'Show Archive Configurations'}
                      onTouchTap={::this.viewArchiveConfig}
                    />
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                showRowHover={false}
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

