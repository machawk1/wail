import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {connect} from 'react-redux'
import {Tabs, Tab} from 'material-ui/Tabs'
import fs from 'fs-extra'
import Rx from 'rxjs/Rx'
import {List, ListItem} from 'material-ui/List'
import Button from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import FriendListItem from './friendListItem'
import _ from 'lodash'

class ArchiveFromFriends extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
      loading: true,
      friends: []
    }
    this.checkedItems = {}
  }

  componentWillUnmount () {
    console.log('component will unmount archive from friends')
  }

  componentWillMount () {
    console.log('component will mount archive from friends')
  }

  componentDidUpdate (prevProps, prevState, prevContext) {
    console.log('componentDidUpdate from friends')
  }

  render () {
    return (
      <div style={{ height: 'inherit', width: '100%' }} />
    )
  }
}

export default ArchiveFromFriends
