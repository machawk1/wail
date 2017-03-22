import React, { PropTypes } from 'react'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import { Link } from 'react-router-dom'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import EventIcon from 'material-ui/svg-icons/action/event'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import routeNames from '../../../routes/routeNames'

const lStyle = { textDecoration: 'none' }

const WailAppDrawer = ({ open, onRequestChange, handleClose }) => (
  <Drawer
    docked={false}
    width={200}
    open={open}
    onRequestChange={onRequestChange}
  >
    <Link
      style={lStyle}
      to={routeNames.selectCol}
      onClick={() => {
        handleClose('Collections', routeNames.selectCol)
      }}
    >
      <MenuItem
        id='sidebarWail'
        primaryText={'Collections'}
        rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/linux/whale_64.png'}/>}
      />
    </Link>
    <Divider />
    <Link
      style={lStyle}
      to={routeNames.heritrix}
      onClick={() => {
        handleClose('Heritrix', routeNames.heritrix)
      }}
    >
      <MenuItem
        id='sidebarHeritrix'
        primaryText={'Crawls'}
        rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
      />
    </Link>
    <Divider />
    <Link
      style={lStyle}
      to={routeNames.services}
      onClick={() => {
        handleClose('Services', routeNames.services)
      }}
    >
      <MenuItem
        id='sidebarServices'
        primaryText='Service Statuses'
        rightIcon={<ServiceIcon />}
      />
    </Link>
    <Link
      style={lStyle}
      to={routeNames.misc}
      onClick={() => {
        handleClose('Event Log', routeNames.misc)
      }}
    >
      <MenuItem
        id='sidebarMisc'
        primaryText='Event Log'
        rightIcon={<EventIcon />}
      />
    </Link>
    <Divider />
    <Link
      style={lStyle}
      to={routeNames.twitter}
      onClick={() => {
        handleClose('Archive Twitter', routeNames.twitter)
      }}
    >
      <MenuItem
        id='sidebarTwitter'
        primaryText='Archive Twitter'
      />
    </Link>
  </Drawer>
)

WailAppDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
}

export default WailAppDrawer