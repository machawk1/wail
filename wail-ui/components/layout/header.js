import React, { Component, PropTypes } from 'react'
import { Row } from 'react-flexbox-grid'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import styles from '../styles/styles'
import { Link, IndexLink } from 'react-router'
import CrawlStore from '../../stores/crawlStore'
import wailConstants from '../../constants/wail-constants'
const defaultCol = wailConstants.Default_Collection

export default class Header extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: 'WAIL', crawlIconVisible: 'hidden' }
  }

  @autobind
  handleToggle () {
    this.setState({ open: !this.state.open })
  }

  componentWillMount () {
    CrawlStore.on('maybe-toggle-ci',this.maybeToggleCrawlIcon)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('maybe-toggle-ci',this.maybeToggleCrawlIcon)
  }

  @autobind
  maybeToggleCrawlIcon(started = false){
    if(started && this.state.crawlIconVisible === 'hidden') {
      this.setState({crawlIconVisible: 'visible'})
    } else {
      if(this.state.crawlIconVisible === 'visible') {
        this.setState({crawlIconVisible: 'hidden'})
      }
    }
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
      <div className="layoutHeader">
        <AppBar
          title={this.state.location}
          onLeftIconButtonTouchTap={this.handleToggle}
          zDepth={0}
          iconElementRight={<Avatar backgroundColor={'transparent'} src='icons/crawling.png'  className="pulse" style={
            {paddingRight: 25,visibility: this.state.crawlIconVisible}}/>
          }

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
            containerElement={<Link to={`wayback/${window.lastWaybackPath}`} />}
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
