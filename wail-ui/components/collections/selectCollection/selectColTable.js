import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { BehaviorSubject } from 'rxjs'
import { connect } from 'react-redux'
import SortDirection from '../../sortDirection/sortDirection'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import fuzzyFilter from '../../../util/fuzzyFilter'
import CollectionCard from './collectionCard'

const stateToProp = state => ({collections: state.get('collections')})

class SelectColTable extends Component {
  static propTypes = {
    collections: PropTypes.instanceOf(Immutable.Map).isRequired,
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired
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
        this.setState({searchText})
      }
    })
  }

  componentWillUnmount () {
    this.filterSubscription.unsubscribe()
    this.filterSubscription = null
  }

  renCollectionCards () {
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
    for (let i = 0; i < len; ++i) {
      let col = cols.get(i)
      let cname = col.get('colName')
      trs.push(
        <CollectionCard key={`${i}-${cname}`} col={col} ccKey={`${i}-${cname}-theCC`}/>
      )
    }

    return trs
  }

  setSortState (sortKey, sortDirection) {
    this.setState({sortDirection, sortKey})
  }

  render () {
    let trs = this.renCollectionCards()
    let sdirection = this.state.sortDirection || SortDirection.ASC
    return (
      <div style={{height: 'inherit', margin: 'auto', paddingTop: '5px', paddingLeft: '35px', paddingRight: '35px'}}>
        <MyAutoSizer findElement='cViewContainer'>
          {({height}) => {
            return (
              <div
                style={{height, maxHeight: `${height - 165}px`, overflowY: 'auto'}}
              >
                {trs}
              </div>
            )
          }}
        </MyAutoSizer>
      </div>
    )
  }
}

export default connect(stateToProp)(SelectColTable)
