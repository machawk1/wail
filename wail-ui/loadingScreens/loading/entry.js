import '../../../wailPollyfil'
import '../../css/wail.css'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Loading from './loading'

window.React = React

injectTapEventPlugin()

ReactDOM.render(<Loading />, document.getElementById('loading'))
