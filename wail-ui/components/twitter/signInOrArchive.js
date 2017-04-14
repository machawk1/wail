import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Immutable from 'immutable'
import {connect} from 'react-redux'
import SignIn from './signIn'
import ArchiveTwitter from './archiveTwitter'

const stateToProp = state => ({
  twitter: state.get('twitter')
})

class SignInOrArchive extends Component {
  static propTypes = {
    twitter: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {!this.props.twitter.get('userSignedIn') && <SignIn />}
        {this.props.twitter.get('userSignedIn') && <ArchiveTwitter twitter={this.props.twitter} />}
      </div>
    )
  }
}

export default connect(stateToProp)(SignInOrArchive)
