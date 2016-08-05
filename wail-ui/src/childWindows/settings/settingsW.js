import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import SettingsForm from './settingsForm'

window.React = React

injectTapEventPlugin()

ReactDOM.render(
  <SettingsForm />,
  document.getElementById('settings'))

