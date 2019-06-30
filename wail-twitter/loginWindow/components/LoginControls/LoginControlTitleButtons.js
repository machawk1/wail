import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ToolBar from 'material-ui/Toolbar/Toolbar'
import ToolbarGroup from 'material-ui/Toolbar/ToolbarGroup'
import ToolbarTitle from 'material-ui/Toolbar/ToolbarTitle'
import ToolbarSeparator from 'material-ui/Toolbar/ToolbarSeparator'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import { amber500, red500, cyan700 } from 'material-ui/styles/colors'
import ReturnIcon from 'material-ui/svg-icons/hardware/keyboard-return'
import IconButton from 'material-ui/IconButton'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
import CancelIcon from 'material-ui/svg-icons/navigation/cancel'
import { buttons } from '../../constants/index'
import { closeWindow, refreshWindow } from '../../actions'

function statToProps (state) {
  return {nav: state.get('nav')}
}

function dispatchToProps (dispatch, ownProps) {
  return bindActionCreators({goBack: ownProps.goBack, goToLoginIndex: ownProps.goToLoginIndex, closeWindow}, dispatch)
}

class LoginControlTitleButtons extends Component {
  static propTypes = {
    nav: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
    goToLoginIndex: PropTypes.func.isRequired,
    closeWindow: PropTypes.func.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.nav !== nextProps.nav
  }

  justMessage (message) {
    return (
      <ToolBar>
        <ToolbarGroup firstChild>
          <ToolbarTitle style={{marginLeft: 15, textAlign: 'center', padding: 0}} text={<span>{message}</span>} />
          <ToolbarSeparator style={{marginLeft: 15, marginRight: 5}} />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            onTouchTap={this.props.closeWindow}
            tooltip='Cancel'
            tooltipPosition='top-left'
          >
            <CancelIcon hoverColor={red500} />
          </IconButton>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  backButton (message) {
    return (
      <ToolBar>
        <ToolbarGroup firstChild>
          <ToolbarTitle style={{marginLeft: 15, textAlign: 'center', padding: 0}} text={<span>{message}</span>} />
          <ToolbarSeparator style={{marginLeft: 15, marginRight: 5}} />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            onTouchTap={this.props.goBack}
            tooltip='Back'
            tooltipPosition='top-left'
          >
            <BackIcon hoverColor={cyan700} />
          </IconButton>
          <IconButton
            onTouchTap={this.props.closeWindow}
            tooltip='Cancel'
            tooltipPosition='top-left'
          >
            <CancelIcon hoverColor={red500} />
          </IconButton>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  signinIndex (message) {
    return (
      <ToolBar>
        <ToolbarGroup firstChild>
          <ToolbarTitle style={{marginLeft: 15, textAlign: 'center', padding: 0}} text={<span>{message}</span>} />
          <ToolbarSeparator style={{marginLeft: 15, marginRight: 5}} />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            onTouchTap={this.props.goToLoginIndex}
            tooltip='Go Back To Sign In'
            tooltipPosition='top-left'
          >
            <ReturnIcon hoverColor={cyan700} />
          </IconButton>
          <IconButton
            onTouchTap={refreshWindow}
            tooltip='Restart'
            tooltipPosition='top-left'
          >
            <RefreshIcon hoverColor={amber500} />
          </IconButton>
          <IconButton
            onTouchTap={this.props.closeWindow}
            tooltip='Cancel'
            tooltipPosition='top-left'
          >
            <CancelIcon hoverColor={red500} />
          </IconButton>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  render () {
    const {nav} = this.props
    const messaage = nav.get('message')
    const buttonState = nav.get('buttonState')
    if (buttonState === buttons.JUST_MESSAGE) {
      return this.justMessage(messaage)
    } else if (buttonState === buttons.BACK_BUTTON) {
      return this.backButton(messaage)
    } else {
      return this.signinIndex(messaage)
    }
  }
}

export default connect(statToProps, dispatchToProps)(LoginControlTitleButtons)
