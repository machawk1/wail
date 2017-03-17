import React, { Component, PropTypes } from 'react'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import changeLocation from '../../../actions/changeLocation'
import CrawlIndicator from '../crawlingIndicator'
import WailAppBar from './wailAppBar'
import routeNames from '../../../routes/routeNames'


export default class Header extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {open: false, location: 'Collections'}
    if (process.env.WAILTEST) {
      window.___header = {
        curState: () => this.state,
        toggle: () => {
          this.handleToggle()
        },
        goHome: () => {
          this.handleClose('Collections', routeNames.selectCol)
        }
      }
    }
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
        <WailAppBar CrawlIndicator={<CrawlIndicator />} leftIconTouchTap={::this.handleToggle}/>
        <Drawer
          docked={false}
          width={200}
          open={this.state.open}
          onRequestChange={::this.open}
        >
          <MenuItem
            id='sidebarWail'
            primaryText={'Collections'}
            rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'}/>}
            onTouchTap={(e) => this.handleClose('Collections', routeNames.selectCol)}
          />
          <Divider />
          <MenuItem
            id='sidebarHeritrix'
            primaryText={'Crawls'}
            rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
            onTouchTap={(e) => this.handleClose('Heritrix', routeNames.heritrix)}/>
          <Divider />
          <MenuItem
            id='sidebarServices'
            primaryText={'Service Statuses'}
            rightIcon={<ServiceIcon />}
            onTouchTap={(e) => this.handleClose('Services', routeNames.services)}/>
          <MenuItem
            id='sidebarMisc'
            primaryText={'Event Log'}
            onTouchTap={(e) => this.handleClose('Event Log', routeNames.misc)}/>
          <Divider />
          <MenuItem
            id='sidebarTwitter'
            primaryText={'Twitter Archive'}
            onTouchTap={(e) => this.handleClose('Twitter Archive', routeNames.twitter)}/>
        </Drawer>
      </div>
    )
  }
}

