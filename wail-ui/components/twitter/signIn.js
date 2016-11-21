import React, {Component, PropTypes} from 'react'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {ipcRenderer as ipc} from 'electron'
import {signedIntoTwitter} from '../../actions/redux/twitter'

export default class SignIn extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      disabled: false
    }

    ipc.once('signed-into-twitter', (e, whatHappened) => {
      if (!whatHappened.wasError) {
        this.context.store.dispatch(signedIntoTwitter())
      } else {
        console.log('dang error case :(')
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
            In order to use this feature you must authorize WAIL to access your account.
            You can do so by clicking the sign in button.
            After doing so a new window will appear for you to do so.
            Once you have authorized WAIL the window will close and the
            fun will begin
          </CardText>
          <CardActions>
            <FlatButton disabled={this.state.disabled} label='Sign In' labelPosition='before'
                        onTouchTap={::this.doSignIn}/>
          </CardActions>
        </Card>
      </div>
    )
  }

}
