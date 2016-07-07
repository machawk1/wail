import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { remote } from 'electron'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import styles from '../styles/styles'
import { Link, IndexLink } from 'react-router'

export default class Header extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: "Basic" }
    this.hacky = '\t\t\t\t\t\t\t\t\t'
  }

  @autobind
  handleToggle () {
    if (!this.state.open) {
      console.log('we are opening the drawer')
    }
    this.setState({ open: !this.state.open })
  }

  @autobind
  handleClose (event, toWhere) {
    remote.getCurrentWindow().setTitle(`Web Archiving Integration Layer: ${toWhere}`)
    this.setState({ open: false })
  }

  render () {
    return (
      <div>
        <AppBar
          title="Wail"
          onLeftIconButtonTouchTap={this.handleToggle}
          zDepth={0}
          style={styles.appBar}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.open}
          onRequestChange={(open) => this.setState({open})}
        >
          <MenuItem
            primaryText={"Basic"}
            containerElement={<IndexLink to="/"/>}
            onTouchTap={(e) => this.handleClose(e,"Basic")}/>
          <MenuItem
            primaryText={"Service Statuses"}
            containerElement={<Link to="services" />}
            onTouchTap={(e) => this.handleClose(e,"Services")}/>
          <MenuItem
            primaryText={"Wayback"}
            containerElement={<Link to="wayback" />}
            onTouchTap={(e) => this.handleClose(e,"Wayback")}/>
          <MenuItem
            primaryText={"Heritrix"}
            containerElement={<Link to="heritrix" />}
            onTouchTap={(e) => this.handleClose(e,"Heritrix")}/>
          <MenuItem
            primaryText={"Miscellaneous"}
            containerElement={<Link to="misc" />}
            onTouchTap={(e) => this.handleClose(e,"Misc")}/>
        </Drawer>
      </div>
    )
  }
}


