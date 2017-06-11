import React from 'react'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { render } from 'react-dom'
import LogIn from './containers/login'
import sms from 'source-map-support'
sms.install()

injectTapEventPlugin()


render(<LogIn />, document.getElementById('loginControl'))
