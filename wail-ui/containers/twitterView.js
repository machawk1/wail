import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import ATwitterUser from '../components/twitter/archiveConfig/aTwitterUser'

export default class TwitterView extends Component {
  render () {
    return (
      <div style={{ width: '100%', height: '100%' }} id='twitterArchive'>
        <ATwitterUser/>
      </div>
    )
  }
}

