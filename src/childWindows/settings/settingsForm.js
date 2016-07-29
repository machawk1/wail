import React, { Component, PropTypes } from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { List } from 'material-ui/List'
import { remote } from 'electron'
import autobind from 'autobind-decorator'
import WailSettings from './wailSettings'
import WaybackSettings from './waybackSettings'
import HeritrixSettings from './heritrixSettings'

const baseTheme = getMuiTheme(lightBaseTheme)
const settings = remote.getGlobal('settings')

export default class SettingsForm extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      muiTheme: baseTheme,
      slideIndex: 0,
    }
  }

  @autobind
  handleChange (value) {
    this.setState({
      slideIndex: value,
    })
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  render () {
    return (
      <List style={{
        overflow: 'hidden',
        overflowY: 'auto',
        height: 250
      }}>
        <WailSettings settings={settings}/>
        <WaybackSettings settings={settings}/>
        <HeritrixSettings settings={settings}/>
      </List>
    )
  }
}
