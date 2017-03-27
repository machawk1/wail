import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import { BehaviorSubject } from 'rxjs'
import { connect } from 'react-redux'
import CollectionViewHeader from './collectionViewHeader'
import SeedTable from './seedTable2'

const depthToConfig = d => {
  if (d === 1) {
    return 'Page + Same Domain Links'
  } else {
    return 'Page + All internal and external links'
  }
}

const stateToProps = (state, ownProps) => {
  console.log('view col', ownProps)
  const collection = state.get('collections').get(ownProps.viewingCol)
  const colName = collection.get('colName')
  const crawls = state.get('runs').filter((crawl, jid) => crawl.get('forCol') === colName)
  const seedConfig = {}
  let i = 0
  collection.get('seeds').forEach(seed => {
    seed.get('jobIds').forEach(jid => {
      let crawl = crawls.get(`${jid}`), url = seed.get('url')
      if (crawl) {
        if (seedConfig[url]) {
          seedConfig[url].add(depthToConfig(crawl.get('depth')))
        } else {
          seedConfig[url] = new Set()
          seedConfig[url].add(depthToConfig(crawl.get('depth')))
        }
      } else {
        if (seedConfig[url]) {
          seedConfig[url].add('Page Only')
        } else {
          seedConfig[url] = new Set()
          seedConfig[url].add('Page Only')
        }
      }
      return true
    })
    return true
  })
  return {
    collection,
    seedConfig
  }
}

class ViewCollection extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired,
    seedConfig: PropTypes.object.isRequired,
    viewingCol: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.filterText = new BehaviorSubject('')
  }

  componentWillUnmount () {
    this.filterText.complete()
    this.filterText = null
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log('colview combined should component update')
    return this.props.collection !== nextProps.collection
  }

  render () {
    return (
      <div style={{width: '100%', height: '100%'}}>
        <CollectionViewHeader filterText={this.filterText} collection={this.props.collection} />
        <SeedTable filterText={this.filterText} collection={this.props.collection} seedConfig={this.props.seedConfig} />
      </div>
    )
  }
}

export default connect(stateToProps)(ViewCollection)
