import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import Rx from 'rxjs/Rx'
import {connect} from 'react-redux'
import CollectionViewHeader from './collectionViewHeader'
import SeedTable from './seedTable'
import {Menu, MenuItem} from 'material-ui/Menu'
import { Card} from 'material-ui/Card'
import AddSeedFab from './addSeedFab'

const depthToConfig = d => {
  if (d === 1) {
    return 'Page + Same Domain Links'
  } else {
    return 'Page + All internal and external links'
  }
}


const stateToProps = (state, ownProps) => {
  const collection = state.get('collections').get(ownProps.viewingCol)
  const colName = collection.get('colName')
  const crawls = state.get('runs').filter((crawl, jid) => crawl.get('forCol') === colName)
  const seedConfig = {}
  let i =0
  collection.get('seeds').forEach(seed => {
    seed.get('jobIds').forEach(jid => {
      let crawl = crawls.get(`${jid}`),url =  seed.get('url')
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
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log('colview combined should component update')
    return this.props.collection !== nextProps.collection
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CollectionViewHeader collection={this.props.collection} />
        <SeedTable collection={this.props.collection} seedConfig={this.props.seedConfig} />
        <AddSeedFab viewingCol={this.props.viewingCol} />
      </div>
    )
  }
}

export default connect(stateToProps)(ViewCollection)
