import 'babel-polyfill'
import 'react-flex/index.css'
import '../../css/wail.css'
import React from 'react'
import { render } from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import FirstTime from './containers/firstTime'
import configureStore from '../store/firstTime'
window.React = React

injectTapEventPlugin()

const store = configureStore()

render(<FirstTime store={store} />, document.getElementById('loading'))
