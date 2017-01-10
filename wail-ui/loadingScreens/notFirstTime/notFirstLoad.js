import '../../../wailPollyfil'
import 'react-flex/index.css'
import '../../css/wail.css'
import React from 'react'
import { render } from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import NotFirstTime from './containers/notFirstTime'
import configureStore from '../store/notFirstTime'

window.React = React

injectTapEventPlugin()

const store = configureStore()

render(<NotFirstTime store={store} />, document.getElementById('loading'))

