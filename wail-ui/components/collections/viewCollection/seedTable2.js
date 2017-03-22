import React, { Component, PropTypes } from 'react'
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
      searchText: '',
    }

    this.filterSubscription = null
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.collection !== nextProps.collection || this.state.searchText !== nextState.searchText
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

  renTr () {
    let viewingCol = this.props.collection.get('colName')
    let trs = []
    let seeds = this.props.collection.get('seeds')
      .filter(aSeed => fuzzyFilter(this.state.searchText, aSeed.get('url')))
      .sort((s1, s2) => momentSortRev(s1.get('added'), s2.get('added')))
    let len = seeds.size, i = 0
    if (len === 0) {
      trs.push(<MementoCardEmpty viewingCol={viewingCol} key="mce"/>)
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

  render () {
    let trs = this.renTr()
    return (
      <div style={{height: 'inherit', margin: 'auto', paddingTop: '5px', paddingLeft: '35px', paddingRight: '35px'}}>
        <MyAutoSizer findElement='collViewDiv'>
          {({height}) => (
            <div style={{height: height, maxHeight: `${height - 160}px`, overflowY: 'auto'}}>
              {trs}
            </div>
          )}
        </MyAutoSizer>
      </div>
    )
  }
}

