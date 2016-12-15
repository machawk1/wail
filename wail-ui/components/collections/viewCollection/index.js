import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import Rx from 'rxjs/Rx'
import {connect} from 'react-redux'
import CollectionViewHeader from './collectionViewHeader'
import SeedTable from './seedTable'
import AddSeedFab from './addSeedFab'

const stateToProps = (state, ownProps) => ({
  collection: state.get('collections').get(ownProps.viewingCol)
})

class ViewCollection extends Component {
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired,
    viewingCol: PropTypes.string.isRequired
  }
  // shouldComponentUpdate (nextProps, nextState, nextContext) {
  //   console.log('colview combined should component update')
  //   return shallowCompare(this, nextProps, nextState)
  // }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CollectionViewHeader collection={this.props.collection} />
        <SeedTable collection={this.props.collection} />
        <AddSeedFab viewingCol={this.props.viewingCol} />
      </div>
    )
  }
}

export default connect(stateToProps)(ViewCollection)
