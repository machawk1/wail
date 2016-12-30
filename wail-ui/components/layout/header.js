import React, { Component, PropTypes } from 'react'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import CrawlIndicator from './crawlingIndicator'
import changeLocation from '../../actions/changeLocation'
import Promise from 'bluebird'

export default class Header extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {open: false, location: 'WAIL'}
    if (process.env.WAILTEST) {
      window.___header = {
        curState: () => this.state,
        toggle: () => {
          this.handleToggle()
        },
        goTo: (loc, to) => {
          this.handleClose(loc, to)
        }
      }

    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {open, location} = this.state
    return open !== nextState.open || location !== nextState.location
  }

  handleToggle () {
    this.setState({open: !this.state.open})
  }

  open (open) {
    this.setState({open})
  }

  handleClose (location, to) {
    this.context.store.dispatch(changeLocation(to))
    this.setState({open: false, location})
  }

  render () {
    return (
      <div>
        <AppBar
          id='wailAppBar'
          title={this.state.location}
          onLeftIconButtonTouchTap={::this.handleToggle}
          iconElementRight={<CrawlIndicator />}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.open}
          onRequestChange={::this.open}
        >
          <MenuItem
            id='sidebarWail'
            primaryText={'WAIL'}
            rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'}/>}
            onTouchTap={(e) => this.handleClose('WAIL', '/')}/>
          <Divider />
          <MenuItem
            id='sidebarHeritrix'
            primaryText={'Heritrix'}
            rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
            onTouchTap={(e) => this.handleClose('Heritrix', '/heritrix')}/>
          <Divider />
          <MenuItem
            id='sidebarServices'
            primaryText={'Service Statuses'}
            rightIcon={<ServiceIcon />}
            onTouchTap={(e) => this.handleClose('Services', '/services')}/>
          <MenuItem
            id='sidebarMisc'
            primaryText={'Miscellaneous'}
            onTouchTap={(e) => this.handleClose('Miscellaneous', '/misc')}/>
          <Divider />
          <MenuItem
            id='sidebarTwitter'
            primaryText={'Twitter Archive'}
            onTouchTap={(e) => this.handleClose('Twitter Archive', '/twitter')}/>
        </Drawer>
      </div>
    )
  }
}
