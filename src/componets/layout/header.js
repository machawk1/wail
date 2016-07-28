import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import styles from '../styles/styles'
import { Link, IndexLink } from 'react-router'

export default class Header extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: 'WAIL' }
  }

  @autobind
  handleToggle () {
    if (!this.state.open) {
      // console.log('we are opening the drawer')
    }
    this.setState({ open: !this.state.open })
  }

  @autobind
  open (open) {
    this.setState({ open })
  }

  @autobind
  handleClose (event, toWhere) {
    this.setState({ open: false, location: toWhere })
  }

  render () {
    return (
      <div>
        <AppBar
          title={this.state.location}
          onLeftIconButtonTouchTap={this.handleToggle}
          iconElementRight={<Avatar className="img-circle" backgroundColor={'transparent'} src={'icons/whale.ico'}/>}
            zDepth={0}
          style={styles.appBar}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.open}
          onRequestChange={this.open}
        >
          <MenuItem
            primaryText={'WAIL'}
            containerElement={<IndexLink to="/"/>}
            onTouchTap={(e) => this.handleClose(e, 'WAIL')}/>
          <Divider/>
          <MenuItem
            primaryText={'Wayback'}
            containerElement={<Link to='wayback'/>}
            onTouchTap={(e) => this.handleClose(e, 'Wayback')}/>
          <MenuItem
            primaryText={'Heritrix'}
            containerElement={<Link to='heritrix'/>}
            onTouchTap={(e) => this.handleClose(e, 'Heritrix')}/>
          <Divider/>
          <MenuItem
            primaryText={'Service Statuses'}
            containerElement={<Link to='services'/>}
            onTouchTap={(e) => this.handleClose(e, 'Services')}/>
          <MenuItem
            primaryText={'Miscellaneous'}
            containerElement={<Link to='misc'/>}
            onTouchTap={(e) => this.handleClose(e, 'Misc')}/>
        </Drawer>
      </div>
    )
  }
}
