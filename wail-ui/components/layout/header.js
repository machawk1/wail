import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import Breadcrumbs from './breadCrumbs'
import {Link, IndexLink} from 'react-router'

import wailConstants from '../../constants/wail-constants'
import CrawlIndicator from './crawlingIndicator'
const defaultCol = wailConstants.Default_Collection

export default class Header_ extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: 'WAIL', crawlIconVisible: 'hidden', search: '' }
  }

  @autobind
  handleToggle () {
    this.setState({ open: !this.state.open })
  }

  @autobind
  open (open) {
    this.setState({ open })
  }

  @autobind
  handleClose (toWhere) {
    this.setState({ open: false, location: toWhere })
  }

  render () {
    return (
      <div>
        <AppBar
          title={<Breadcrumbs />}
          onLeftIconButtonTouchTap={this.handleToggle}
          iconElementRight={<CrawlIndicator />}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.open}
          onRequestChange={this.open}
        >
          <MenuItem
            primaryText={'WAIL'}
            rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'} />}
            containerElement={<IndexLink to='/' />}
            onTouchTap={(e) => this.handleClose('WAIL')} />
          <Divider />
          <MenuItem
            primaryText={'Wayback'}
            rightIcon={<Avatar backgroundColor={'transparent'} src='icons/openWB.png' />}
            containerElement={<Link to={`wayback`} />}
            onTouchTap={(e) => this.handleClose('Wayback')} />
          <MenuItem
            primaryText={'Heritrix'}
            rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif' />}
            containerElement={<Link to='heritrix' />}
            onTouchTap={(e) => this.handleClose('Heritrix')} />
          <Divider />
          <MenuItem
            primaryText={'Service Statuses'}
            rightIcon={<ServiceIcon />}
            containerElement={<Link to='services' />}
            onTouchTap={(e) => this.handleClose('Services')} />
          <MenuItem
            primaryText={'Miscellaneous'}
            containerElement={<Link to='misc' />}
            onTouchTap={(e) => this.handleClose('Miscellaneous')} />
        </Drawer>
      </div>
    )
  }
}

/*
 <AppBar
 title={this.state.location}
 onLeftIconButtonTouchTap={this.handleToggle}
 zDepth={0}
 iconElementRight={<Avatar backgroundColor={'transparent'} src='icons/crawling.png'  className="pulse" style={
 {paddingRight: 25,visibility: this.state.crawlIconVisible}}/>
 }
 style={{height: '50px'}}
 titleStyle={{height: '50px'}}

 />
 */
