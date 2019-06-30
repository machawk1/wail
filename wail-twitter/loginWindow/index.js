import 'babel-polyfill'
import React from 'react'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { render } from 'react-dom'
import LogIn from './containers/Login'
// sms.install({
//   environment: 'node'
// })

injectTapEventPlugin()

render(<LogIn />, document.getElementById('loginControl'))
