import React, { Component, PropTypes } from 'react'
import { BehaviorSubject } from 'rxjs'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import SelectColList from './selectColList'

const stateToProp = state => ({ collections: state.get('collections') })

class SelectCol extends Component {
  static propTypes = {
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired,
    collections: PropTypes.instanceOf(Map).isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = { searchText: '' }
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

  render () {
    return (
      <SelectColList collections={this.props.collections} filterText={this.state.searchText}/>
    )
  }
}

export default connect(stateToProp)(SelectCol)