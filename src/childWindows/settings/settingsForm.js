import React, { Component, PropTypes } from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import RaisedButton from 'material-ui/RaisedButton'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MenuItem from 'material-ui/MenuItem'
import { ipcRenderer, remote } from 'electron'
import autobind from 'autobind-decorator'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'

const baseTheme = getMuiTheme(lightBaseTheme)

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
}

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
  handleChange(value){
    this.setState({
      slideIndex: value,
    })
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }
  render() {
    return (
      <div>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label="WAIL" value={0} />
          <Tab label="Heritrix" value={1} />
          <Tab label="Wayback" value={2} />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div>
            <h2 style={styles.headline}>Tabs with slide effect</h2>
            Swipe to see the next slide.<br />
          </div>
          <div style={styles.slide}>
            slide n°2
          </div>
          <div style={styles.slide}>
            slide n°3
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
