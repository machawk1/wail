import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import Rx from 'rxjs/Rx'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import SortDirection from '../../sortDirection/sortDirection'
import SortHeader from '../../sortDirection/sortHeader'
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import fuzzyFilter from '../../../util/fuzzyFilter'

const stateToProp = state => ({ collections: state.get('collections') })

class SelectColTable extends Component {
  static propTypes = {
    collections: PropTypes.instanceOf(Immutable.Map).isRequired,
    filterText: PropTypes.instanceOf(Rx.BehaviorSubject).isRequired
  }
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: '',
      sortDirection: null,
      sortKey: ''
    }

    this.filterSubscription = null
  }

  componentDidMount () {
    this.filterSubscription = this.props.filterText.subscribe({
      next: (searchText) => {
        this.setState({ searchText })
      }
    })
  }

  componentWillUnmount () {
    this.filterSubscription.unsubscribe()
    this.filterSubscription = null
  }

  renTr () {
    let trs = []
    let cols
    if (this.state.sortDirection) {
      cols = this.props.collections.toList()
        .filter(aCol => fuzzyFilter(this.state.searchText, aCol.get('colName')))
        .sortBy(aCol => aCol.get('colName').toLowerCase())
        .update(list => this.state.sortDirection === SortDirection.DESC ? list.reverse() : list)
    } else {
      cols = this.props.collections.toList().filter(aCol => fuzzyFilter(this.state.searchText, aCol.get('colName')))
    }
    let len = cols.size
    let { primary1Color } = this.context.muiTheme.baseTheme.palette
    for (let i = 0; i < len; ++i) {
      let col = cols.get(i)
      let cname = col.get('colName')
      trs.push(<TableRow key={`${i}-${cname}`}>
        <TableRowColumn key={`${i}-${cname}-name`}>
          <Link to={`Collections/${cname}`} style={{ color: primary1Color, textDecoration: 'none' }}>{cname}</Link>
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-numSeeds`}>
          {col.get('seeds').size}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-lastUpdated`}>
          {col.get('lastUpdated').format('MMM DD YYYY h:mma')}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${cname}-size`}>
          {col.get('size')}
        </TableRowColumn>
      </TableRow>)
    }

    return trs
  }

  setSortState (sortKey, sortDirection) {
    this.setState({ sortDirection, sortKey })
  }

  render () {
    let trs = this.renTr()
    let sdirection = this.state.sortDirection || SortDirection.ASC
    return (
      <MyAutoSizer findElement='cViewContainer'>
        {({ height }) => {
          return (
            <Table
              height={`${height - 130}px`}
            >
              <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
              >
                <TableRow >
                  <SortHeader
                    key='SortHeader-name'
                    text='Name' sortDirection={sdirection}
                    onTouchTap={::this.setSortState}/>
                  <TableHeaderColumn>
                    Seeds
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Last Updated
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Size
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                displayRowCheckbox={false}
              >
                {trs}
              </TableBody>
            </Table>
          )
        }}
      </MyAutoSizer>
    )
  }

}

export default connect(stateToProp)(SelectColTable)