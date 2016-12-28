import React, {Component, PropTypes} from 'react'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {ipcRenderer as ipc} from 'electron'
import {signedIntoTwitter} from '../../actions/twitter'
import {notify} from '../../actions/notification-actions'

export default class SignIn extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      disabled: false
    }

    ipc.on('signed-into-twitter', (e, whatHappened) => {
      if (!whatHappened.wasError) {
        this.context.store.dispatch(signedIntoTwitter())
      } else {
        console.log('dang error case :(')
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
    ipc.send('sign-in-twitter')
    this.setState({ disabled: true })
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Card>
          <CardTitle
            title='You have not signed into Twitter through WAIL'
          />
          <CardText>
            In order to use this feature you must authorize WAIL to access your account. <br />
            You can do so by clicking the sign in button. <br />
            After doing so a new window will appear for you to do so. <br />
            Once you have authorized WAIL the window will close and
            the Archive Twitter Screen will appear
          </CardText>
          <CardActions>
            <FlatButton disabled={this.state.disabled} label='Sign In' labelPosition='before'
              onTouchTap={::this.doSignIn} />
          </CardActions>
        </Card>
      </div>
    )
  }

}
