import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'

function SignIn ({disabled, doSignIn}) {
  return (
    <div style={{width: '100%', height: '100%'}}>
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
          <FlatButton
            disabled={disabled}
            label='Sign In'
            labelPosition='before'
            onTouchTap={doSignIn}
          />
        </CardActions>
      </Card>
    </div>
  )
}

SignIn.propTypes = {
  disabled: PropTypes.bool.isRequired,
  doSignIn: PropTypes.func.isRequired
}

export default SignIn
