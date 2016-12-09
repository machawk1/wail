import React, {Component, PropTypes} from 'react'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import CrawlIndicator from './crawlingIndicator'
import changeLocation from '../../actions/redux/changeLocation'

export default class Header extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: 'WAIL' }
  }

  handleToggle () {
    this.setState({ open: !this.state.open })
  }

  open (open) {
    this.setState({ open })
  }

  handleClose (location, to) {
    this.context.store.dispatch(changeLocation(to))
    this.setState({ open: false, location })
  }

  render () {
    return (
      <div>
        <AppBar
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
            primaryText={'WAIL'}
            rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'} />}
            onTouchTap={(e) => this.handleClose('WAIL', '/')} />
          <Divider />
          <MenuItem
            primaryText={'Heritrix'}
            rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif' />}
            onTouchTap={(e) => this.handleClose('Heritrix', '/heritrix')} />
          <Divider />
          <MenuItem
            primaryText={'Service Statuses'}
            rightIcon={<ServiceIcon />}
            onTouchTap={(e) => this.handleClose('Services', '/services')} />
          <MenuItem
            primaryText={'Miscellaneous'}
            onTouchTap={(e) => this.handleClose('Miscellaneous', '/misc')} />
          <Divider />
          <MenuItem
            primaryText={'Twitter Archive'}
            onTouchTap={(e) => this.handleClose('Twitter Archive', '/twitter')} />
        </Drawer>
      </div>
    )
  }
}
