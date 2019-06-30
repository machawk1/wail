import PropTypes from 'prop-types'
import React, { Component } from 'react'
import fs from 'fs-extra'
import {List, ListItem} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import RefreshIndicator from 'material-ui/RefreshIndicator'

const style = {
  container: {
    position: 'relative'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative'
  }
}

export default class ArchiveTwitter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      friends: []
    }
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
      console.log(i)
      lis.push(
        <ListItem
          style={{ width: '25%' }}
          key={`${i}${friends[ i ].name}`}
          primaryText={friends[ i ].name}
          secondaryText={`@${friends[ i ].screen_name}`}
          leftAvatar={<Avatar key={`proImage-${friends[ i ].name}${i}`} src={friends[ i ].profile_image} />}
        />
      )
    }
    return lis
  }

  render () {
    if (this.state.loading) {
      this.doLoad()
    }
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.loading && <RefreshIndicator
          size={40}
          left={10}
          top={0}
          status='loading'
        />}
        {!this.state.loading &&
        <List style={{ maxHeight: '50%', overflowY: 'auto', overflowX: 'hidden' }}>
          {this.renderFlist()}
        </List>
        }
      </div>
    )
  }
}
