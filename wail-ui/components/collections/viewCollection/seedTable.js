import React, { Component, PropTypes } from 'react'
import Immutable from 'immutable'
import MementoCard, { MementoCardEmpty } from './mementoCard'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import { momentSortRev } from '../../../util/momentSort'

export default class SeedTable extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.collection !== nextProps.collection
  }

  renTr () {
    let viewingCol = this.props.collection.get('colName')
    let trs = []
    let seeds = this.props.collection.get('seeds').sort((s1, s2) => momentSortRev(s1.get('added'), s2.get('added')))
    let len = seeds.size, i = 0
    if (len === 0) {
      trs.push(<MementoCardEmpty key="mce"/>)
    } else {
      for (; i < len; ++i) {
        let seed = seeds.get(i)
        let url = seed.get('url'), conf = 'Not Archived'
        if (this.props.seedConfig[url].size > 0) {
          conf = []
          for (const aConf of  this.props.seedConfig[url]) {
            conf.push(aConf)
            conf.push(<br key={`${i}-br${aConf}`}/>)
          }
        }

        trs.push(<MementoCard key={`${i}-${url}-mc`} conf={conf} seed={seed} url={url} viewingCol={viewingCol}
                              mckey={`${i}-${url}`}/>)
      }
    }
    return trs
  }

  render () {
    let trs = this.renTr()
    return (
      <div style={{height: 'inherit', margin: 'auto', paddingTop: '5px', paddingLeft: '25px', paddingRight: '25px'}}>
        <MyAutoSizer findElement='collViewDiv'>
          {({height}) => (
            <div style={{height: height, maxHeight: `${height - 250}px`, overflowY: 'auto'}}>
              {trs}
            </div>
          )}
        </MyAutoSizer>
      </div>
    )
  }
}

