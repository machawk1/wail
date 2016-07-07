import React, { Component } from 'react'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import Popover from 'material-ui/Popover'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import * as Heritrix from '../actions/heritrix-actions'
import * as Wayback from '../actions/wayback-actions'
import ServiceStore from '../stores/serviceStore'

const styles = {
  button: {
    margin: 12,
  },
}

export default class Debug extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      hopen: false,
      copen: false,
      wopen: false,
    }
    this.handleTouchTap = this.handleTouchTap.bind(this)
    this.handleRequestClose = this.handleRequestClose.bind(this)
    this.launchHeritrix = this.launchHeritrix.bind(this)
    this.killHeritrix = this.killHeritrix.bind(this)
    this.crawl = this.crawl.bind(this)
    this.cClose = this.cClose.bind(this)
    this.wayBackButton = this.wayBackButton.bind(this)
    this.wpopclose = this.wpopclose.bind(this)

  }

  handleTouchTap (event) {
    event.preventDefault()
    this.setState({
      hopen: true,
      anchorEl: event.currentTarget,
    })
  }

  handleRequestClose () {
    this.setState({
      hopen: false,
    })
  }

  cClose () {
    this.setState({
      copen: false,
    })
  }

  wpopclose () {
    this.setState({
      wopen: false,
    })
  }

  launchHeritrix () {
    console.log("Launch HeritrixTab")
    Heritrix.launchHeritrix()
  }

  killHeritrix () {
    console.log("Kill HeritrixTab")
    Heritrix.killHeritrix()
  }

  crawl (event) {
    event.preventDefault()
    this.setState({
      copen: true,
      anchorElc: event.currentTarget,
    })
  }

  wayBackButton (event) {
    event.preventDefault()

    this.setState({
      wopen: true,
      anchorElw: event.currentTarget,
    })
  }

  render () {
    if (false) {//process.env.NODE_ENV === 'development') {
      return (
        <div>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton
                onTouchTap={this.handleTouchTap}
                label="Heritrix"
              />
              <RaisedButton
                onTouchTap={this.wayBackButton}
                label="Wayback"
              />
            </ToolbarGroup>
          </Toolbar>
          <Popover
            open={this.state.hopen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.handleRequestClose}
          >
            <Menu>
              <MenuItem onTouchTap={this.launchHeritrix} primaryText="Start Heritrix"/>
              <MenuItem onTouchTap={this.killHeritrix} primaryText="Kill Heritrix"/>
              <MenuItem onTouchTap={(e) => Heritrix.makeHeritrixJobConf('http://matkelly.com',1)}
                        primaryText="make job"/>
              <MenuItem onTouchTap={(e) => ServiceStore.checkStatues()} primaryText="test-status"/>
            </Menu>
          </Popover>
          <Popover
            open={this.state.wopen}
            anchorEl={this.state.anchorElw}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.wpopclose}
          >
            <Menu>
              <MenuItem onTouchTap={(e) => Wayback.startWayback()} primaryText="Start Wayback"/>
              <MenuItem onTouchTap={(e) => Wayback.killWayback()} primaryText="Kill Wayback"/>

            </Menu>
          </Popover>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }

  }
}
