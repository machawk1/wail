import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Redirect } from 'react-router-dom'
import { notify } from '../actions/notification-actions'
import { ipcRenderer as ipc } from 'electron'
import SignIn from '../components/twitter/signIn'
import signedIntoTwitter from '../actions/twitter'
import routeNames from '../routes/routeNames'

const stateToProps = state => ({
  userSignedIn: state.get('twitter').get('userSignedIn')
})

const dispatchToProps = dispatch => bindActionCreators({ signedIntoTwitter }, dispatch)

class TwitterSignIn extends Component {
  static propTypes = {
    signedIntoTwitter: PropTypes.func.isRequired,
    userSignedIn: PropTypes.bool.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      disabled: false,
    }

    ipc.on('signed-into-twitter', (e, whatHappened) => {
      if (!whatHappened.wasError) {
        this.props.signedIntoTwitter()
      } else {
        this.setState({ disabled: false }, () => {
          window.logger.error(whatHappened.error)
          notify({
            title: 'Twitter Sign In Not Completed',
            level: 'warning',
            message: 'An error occurred during sign in. If you closed the window cary on.',
            autoDismiss: 10
          })
        })
      }
    })
  }

  doSignIn () {
    this.setState({ disabled: true },() => {
      ipc.send('sign-in-twitter')
    })
  }

  render () {
    return this.props.userSignedIn ? (
      <Redirect from={routeNames.twitterSignIn} to={routeNames.twitter} push/>
    ) : (
      <SignIn disabled={this.state.disabled} doSignIn={::this.doSignIn}/>
    )
  }
}

export default connect(stateToProps,dispatchToProps)(TwitterSignIn)
