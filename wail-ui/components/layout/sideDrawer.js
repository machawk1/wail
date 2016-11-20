import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {push} from 'react-router-redux'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {Link, IndexLink} from 'react-router'
import {connect} from 'react-redux'
import {batchActions} from 'redux-batched-actions'
import {openClose, locationChange} from '../../actions/redux/header'

const stateToProps = state => ({
  open: state.get('header').get('open')
})

const dispatchToProps = dispatch => ({
  requestChange (maybeOpen) {
    dispatch(openClose(maybeOpen))
  },
  handleClose (location, to) {
    dispatch(push(to))
    dispatch(locationChange(location))
  },
})

class SideDrawer extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    requestChange: PropTypes.func.isRequired,
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.open !== nextProps.open
  }

  render () {
    return (
      <Drawer
        docked={false}
        width={200}
        open={this.props.open}
        onRequestChange={this.props.requestChange}
      >
        <MenuItem
          primaryText={'WAIL'}
          rightIcon={<Avatar className='img-circle' backgroundColor={'transparent'} src={'icons/whale.ico'}/>}
          onTouchTap={(e) => this.props.handleClose('WAIL', '/')}/>
        <Divider />
        <MenuItem
          primaryText={'Heritrix'}
          rightIcon={<Avatar size={45} backgroundColor={'transparent'} src='icons/heritrix.gif'/>}
          onTouchTap={(e) => this.props.handleClose('Heritrix', '/heritrix')}/>
        <Divider />
        <MenuItem
          primaryText={'Service Statuses'}
          rightIcon={<ServiceIcon />}
          onTouchTap={(e) => this.props.handleClose('Services', '/services')}/>
        <MenuItem
          primaryText={'Miscellaneous'}
          onTouchTap={(e) => this.props.handleClose('Miscellaneous', '/misc')}/>
      </Drawer>
    )
  }
}

export default connect(stateToProps, dispatchToProps)(SideDrawer)
