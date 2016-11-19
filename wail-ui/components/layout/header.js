import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
// import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {Link, IndexLink} from 'react-router'
import {connect} from 'react-redux'
import wailConstants from '../../constants/wail-constants'
import CrawlIndicator from './crawlingIndicator'
import SideDrawer from './sideDrawer'
import AppBar from './appBar'
const defaultCol = wailConstants.Default_Collection

const Header = () => {
  console.log('header rendering')
  return (
    <div>
      <AppBar />
      <SideDrawer />
    </div>
  )
}

export default Header

// export default class Header_ extends Component {
//
//   constructor (props, context) {
//     super(props, context)
//     this.state = { open: false, location: 'WAIL', crawlIconVisible: 'hidden', search: '' }
//   }
//
//   @autobind
//   handleToggle () {
//     this.setState({ open: !this.state.open })
//   }
//
//   @autobind
//   open (open) {
//     this.setState({ open })
//   }
//
//   @autobind
//   handleClose (toWhere) {
//     this.setState({ open: false, location: toWhere })
//   }
//
//   render () {
//     return (
//       <div>
//         <AppBar
//           title={this.state.location}
//           onLeftIconButtonTouchTap={this.handleToggle}
//           iconElementRight={<CrawlIndicator />}
//         />
//         <SideDrawer open={this.state.open} handleClose={this.handleClose} requestChange={this.open}/>
//       </div>
//     )
//   }
// }
