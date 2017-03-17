import React, { Component, PropTypes } from 'react'
import { Map } from 'immutable'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import fuzzyFilter from '../../../util/fuzzyFilter'
import CollectionCard, {NoCollectionMatches} from './collectionCard'

export default class SelectColList extends Component {
  static propTypes = {
    collections: PropTypes.instanceOf(Map).isRequired,
    filterText: PropTypes.string.isRequired
  }

  filterCols (aCol) {
    return fuzzyFilter(this.props.filterText, aCol.get('colName'))
  }

  sortColsBy (aCol) {
    return aCol.get('colName').toLowerCase()
  }

  applyFilter () {
    return this.props.collections.toList()
      .filter(::this.filterCols)
      .sortBy(::this.sortColsBy)
  }

  renCollectionCards () {
    let cols = this.applyFilter(), cards = []
    if (cols.size > 0) {
      let len = cols.size,i=0
      for (; i < len; ++i) {
        let col = cols.get(i)
        let cname = col.get('colName')
        cards.push(
          <CollectionCard key={`${i}-${cname}`} col={col} ccKey={`${i}-${cname}-theCC`}/>
        )
      }
    } else {
      cards.push(
        <NoCollectionMatches key={'no match'} search={this.props.filterText}/>
      )
    }
    return cards
  }

  render () {
    const filterCols = this.renCollectionCards()
    return (
      <MyAutoSizer findElement='cViewContainer'>
        {({height}) => {
          return (
            <div
              style={{height, maxHeight: `${height - 165}px`, overflowY: 'auto'}}
            >
              {filterCols}
            </div>
          )
        }}
      </MyAutoSizer>
    )
  }
}
