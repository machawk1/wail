import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {connect} from 'react-redux'
import SignIn from '../components/twitter/signIn'
import ArchiveTwitter from '../components/twitter/archiveTwitter'

const stateToProp = state => ({
  twitter: state.get('twitter')
})

class TwitterView extends Component {
  static propTypes = {
    twitter: PropTypes.instanceOf(Immutable.Map).isRequired,
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <ArchiveTwitter twitter={this.props.twitter}/>
      </div>
    )
  }

}

export default connect(stateToProp)(TwitterView)