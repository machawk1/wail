import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Map } from 'immutable'
import { BehaviorSubject } from 'rxjs'
import { shell, remote } from 'electron'
import MementoCard, { MementoCardEmpty } from './mementoCard'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import { momentSortRev } from '../../../util/momentSort'
import fuzzyFilter from '../../../util/fuzzyFilter'

const wbUrl = remote.getGlobal('settings').get('pywb.url')

export default class SeedTable extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Map).isRequired,
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: ''
    }
    this.filterSubscription = null
    this.subNext = this.subNext.bind(this)
    this.seedFilter = this.seedFilter.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.collection !== nextProps.collection || this.state.searchText !== nextState.searchText
  }

  componentDidMount () {
    this.filterSubscription = this.props.filterText.subscribe({
      next: this.subNext
    })
  }

  componentWillUnmount () {
    this.filterSubscription.unsubscribe()
    this.filterSubscription = null
  }

  subNext (searchText) {
    this.setState({searchText})
  }

  seedFilter (aSeed) {
    return fuzzyFilter(this.state.searchText, aSeed.get('url'))
  }

  sortByAdded (s1, s2) {
    return momentSortRev(s1.get('added'), s2.get('added'))
  }

  builtMementoCards () {
    let viewingCol = this.props.collection.get('colName')
    let trs = []
    let seeds = this.props.collection.get('seeds').filter(this.seedFilter).sort(this.sortByAdded)
    let len = seeds.size, i = 0
    if (len === 0) {
      trs.push(<MementoCardEmpty viewingCol={viewingCol} key='mce'/>)
    } else {
      for (; i < len; ++i) {
        let seed = seeds.get(i)
        let url = seed.get('url'), conf = 'Not Archived'
        if (this.props.seedConfig[url].size > 0) {
          conf = []
          for (const aConf of this.props.seedConfig[url]) {
            conf.push(aConf)
            conf.push(<br key={`${i}-br${aConf}-${viewingCol}-${url}`}/>)
          }
        }
        trs.push(
          <MementoCard
            i={i}
            key={`${i}-${url}-mc`}
            conf={conf}
            seed={seed}
            url={url}
            viewingCol={viewingCol}
            mckey={`${i}-${url}`}
            openInWb={() => {
              shell.openExternal(`${wbUrl}${viewingCol}/*/${url}`)
            }}
          />)
      }
    }
    return trs
  }

  renderMementoCards (mementoCards, {height}) {
    return (
      <div style={{height: height, maxHeight: `${height - 160}px`, overflowY: 'auto'}}>
        {mementoCards}
      </div>
    )
  }

  render () {
    let mementoCards = this.builtMementoCards()
    return (
      <div id='colSeedsList'
           style={{height: 'inherit', margin: 'auto', paddingTop: '5px', paddingLeft: '35px', paddingRight: '35px'}}>
        <MyAutoSizer findElement='collViewDiv'>
          {this.renderMementoCards.bind(undefined, mementoCards)}
        </MyAutoSizer>
      </div>
    )
  }
}
