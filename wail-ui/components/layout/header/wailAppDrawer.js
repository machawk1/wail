import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import { Link } from 'react-router-dom'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import EventIcon from 'material-ui/svg-icons/action/event'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import routeNames from '../../../routes/routeNames'
import { general } from '../../../constants/uiStrings'

const lStyle = {textDecoration: 'none'}

class WailAppDrawer extends Component {
  goToCollections = () => {
    this.props.handleClose(general.collections, routeNames.selectCol)
  }
  goToHeritrix = () => {
    this.props.handleClose(general.heritrix, routeNames.heritrix)
  }
  goToServices = () => {
    this.props.handleClose(general.serviceStatuses, routeNames.services)
  }
  goToEventLog = () => {
    this.props.handleClose(general.eventLog, routeNames.misc)
  }
  goToArchiveTwitter = () => {
    this.props.handleClose(general.archiveTwitter, routeNames.twitter)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.open !== nextProps.open || this.props.onRequestChange !== nextProps.onRequestChange
  }

  render () {
    const {open, onRequestChange, handleClose} = this.props
    return (
      <Drawer
        docked={false}
        width={200}
        open={open}
        onRequestChange={onRequestChange}
      >
        <div id='sidebarWail'>
          <Link
            style={lStyle}
            to={routeNames.selectCol}
            onClick={this.goToCollections}
          >
            <MenuItem
              id='sidebarCols'
              primaryText={general.collections}
              rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'}
                                 src={'icons/linux/whale_64.png'}/>}
            />
          </Link>
          <Divider />
          <Link
            style={lStyle}
            to={routeNames.heritrix}
            onClick={this.goToHeritrix}
          >
            <MenuItem
              id='sidebarHeritrix'
              primaryText={general.crawls}
              rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
            />
          </Link>
          <Divider />
          <Link
            style={lStyle}
            to={routeNames.services}
            onClick={this.goToServices}
          >
            <MenuItem
              id='sidebarServices'
              primaryText={general.serviceStatuses}
              rightIcon={<ServiceIcon />}
            />
          </Link>
          <Link
            style={lStyle}
            to={routeNames.misc}
            onClick={this.goToEventLog}
          >
            <MenuItem
              id='sidebarMisc'
              primaryText={general.eventLog}
              rightIcon={<EventIcon />}
            />
          </Link>
          <Divider />
          <Link
            style={lStyle}
            to={routeNames.twitter}
            onClick={this.goToArchiveTwitter}
          >
            <MenuItem
              id='sidebarTwitter'
              primaryText={general.archiveTwitter}
            />
          </Link>
        </div>
      </Drawer>
    )
  }

}

// const WailAppDrawer = ({open, onRequestChange, handleClose}) => (
//   <Drawer
//     docked={false}
//     width={200}
//     open={open}
//     onRequestChange={onRequestChange}
//   >
//     <div id='sidebarWail'>
//       <Link
//         style={lStyle}
//         to={routeNames.selectCol}
//         onClick={() => {
//           handleClose(general.collections, routeNames.selectCol)
//         }}
//       >
//         <MenuItem
//           id='sidebarCols'
//           primaryText={general.collections}
//           rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/linux/whale_64.png'}/>}
//         />
//       </Link>
//       <Divider />
//       <Link
//         style={lStyle}
//         to={routeNames.heritrix}
//         onClick={() => {
//           handleClose(general.heritrix, routeNames.heritrix)
//         }}
//       >
//         <MenuItem
//           id='sidebarHeritrix'
//           primaryText={general.crawls}
//           rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
//         />
//       </Link>
//       <Divider />
//       <Link
//         style={lStyle}
//         to={routeNames.services}
//         onClick={() => {
//           handleClose(general.services, routeNames.services)
//         }}
//       >
//         <MenuItem
//           id='sidebarServices'
//           primaryText={general.serviceStatuses}
//           rightIcon={<ServiceIcon />}
//         />
//       </Link>
//       <Link
//         style={lStyle}
//         to={routeNames.misc}
//         onClick={() => {
//           handleClose(general.eventLog, routeNames.misc)
//         }}
//       >
//         <MenuItem
//           id='sidebarMisc'
//           primaryText={general.eventLog}
//           rightIcon={<EventIcon />}
//         />
//       </Link>
//       <Divider />
//       <Link
//         style={lStyle}
//         to={routeNames.twitter}
//         onClick={() => {
//           handleClose(general.archiveTwitter, routeNames.twitter)
//         }}
//       >
//         <MenuItem
//           id='sidebarTwitter'
//           primaryText={general.archiveTwitter}
//         />
//       </Link>
//     </div>
//   </Drawer>
// )

WailAppDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

export default WailAppDrawer
