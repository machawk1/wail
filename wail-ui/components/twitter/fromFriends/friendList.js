import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Immutable from 'immutable'
import {connect} from 'react-redux'
import {Tabs, Tab} from 'material-ui/Tabs'
import fs from 'fs-extra'
import Rx from 'rxjs/Rx'
import {List, ListItem} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Button from 'material-ui/RaisedButton'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import FriendListItem from './friendListItem'
import fuzzyFilter from '../../../util/fuzzyFilter'

const stateToProp = state => ({
  twitter: state.get('twitter')
})

class FriendList extends Component {
  static propTypes = {
    filterText$: PropTypes.instanceOf(Rx.BehaviorSubject).isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
      loading: true,
      friends: []
    }
    this.checkedItems = {}
    this.filterSubscription = null
  }

  componentWillUnmount () {
    console.log('component will unmount archive from friends')
    this.filterSubscription.unsubscribe()
    this.filterSubscription = null
  }

  componentWillMount () {
    console.log('component will mount archive from friends')
  }

  componentDidMount () {
    this.filterSubscription = this.props.filterText$.subscribe({
      next: (searchText) => {
        this.setState({ searchText })
      }
    })
  }

  componentDidUpdate (prevProps, prevState, prevContext) {
    console.log('componentDidUpdate from friends')
  }

  doLoad () {
    console.log('doing load')
    fs.readJSON('/home/john/my-fork-wail/myflist.json', (err, friends) => {
      console.log(err, friends)
      if (err) {
        console.error(err)
      } else {
        this.setState({ friends, loading: false })
      }
    })
  }

  renderFlist () {
    console.log('rendering flist')
    let { friends } = this.state
    let lis = []
    let len = friends.length
    for (let i = 0; i < len; i++) {
      if (fuzzyFilter(this.state.searchText, friends[ i ].name)) {
        console.log(i)
        let checkMe = this.checkedItems[ friends[ i ].name ] ? this.checkedItems[ friends[ i ].name ] : false
        lis.push(
          <FriendListItem
            key={`fli-${i}-${friends[ i ].name}`}
            checked={checkMe}
            cboxKey={`${i}${friends[ i ].name}check`}
            primaryText={friends[ i ].name}
            secondaryText={`@${friends[ i ].screen_name}`}
            onCheck={(isChecked) => {
              this.checkedItems[ friends[ i ].name ] = isChecked
              console.log(this.checkedItems)
            }}
            aSrc={friends[ i ].profile_image}
            aKey={`proImage-${friends[ i ].name}${i}`}
            liKey={`${i}${friends[ i ].name}`}
          />
        )
      }
    }
    return lis
  }

  render () {
    if (this.state.loading) {
      this.doLoad()
    }
    return (
      <div style={{ height: 'inherit', width: '100%' }}>
        {this.state.loading && <RefreshIndicator
          size={40}
          left={10}
          top={0}
          status='loading'
        />}
        {!this.state.loading &&
        <List style={{ maxHeight: '63%', overflowY: 'auto', overflowX: 'hidden' }}>
          {this.renderFlist()}
        </List>
        }
      </div>

    )
  }
}

export default FriendList
