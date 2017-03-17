import React, { PropTypes } from 'react'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import EventIcon from 'material-ui/svg-icons/action/event'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import routeNames from '../../../routes/routeNames'

const WailAppDrawer = ({open,onRequestChange,handleClose}) => (
  <Drawer
    docked={false}
    width={200}
    open={open}
    onRequestChange={onRequestChange}
  >
    <MenuItem
      id='sidebarWail'
      primaryText={'Collections'}
      rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/linux/whale_64.png'}/>}
      onTouchTap={(e) => {
        handleClose('Collections', routeNames.selectCol)
      }}
    />
    <Divider />
    <MenuItem
      id='sidebarHeritrix'
      primaryText={'Crawls'}
      rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
      onTouchTap={(e) => {
        handleClose('Heritrix', routeNames.heritrix)
      }}
    />
    <Divider />
    <MenuItem
      id='sidebarServices'
      primaryText={'Service Statuses'}
      rightIcon={<ServiceIcon />}
      onTouchTap={(e) => {
        handleClose('Services', routeNames.services)
      }}
    />
    <MenuItem
      id='sidebarMisc'
      primaryText={'Event Log'}
      rightIcon={<EventIcon />}
      onTouchTap={(e) => {
        handleClose('Event Log', routeNames.misc)
      }}
    />
    <Divider />
    <MenuItem
      id='sidebarTwitter'
      primaryText={'Archive Twitter'}
      onTouchTap={(e) => {
        handleClose('Archive Twitter', routeNames.twitter)
      }}
    />
  </Drawer>
)

WailAppDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
}

export default WailAppDrawer