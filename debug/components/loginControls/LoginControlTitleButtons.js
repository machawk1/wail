import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ToolBar from 'material-ui/Toolbar/Toolbar'
import FlatButton from 'material-ui/FlatButton'
import ToolbarGroup from 'material-ui/Toolbar/ToolbarGroup'
import ToolbarTitle from 'material-ui/Toolbar/ToolbarTitle'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import ReturnIcon from 'material-ui/svg-icons/hardware/keyboard-return'
import{ buttons } from '../../constants'

function statToProps (state) {
  return {nav: state.get('nav')}
}

function dispatchToProps (dispatch, ownProps) {
  return bindActionCreators({goBack: ownProps.goBack, goToLoginIndex: ownProps.goToLoginIndex}, dispatch)
}

class LoginControlTitleButtons extends Component {
  static propTypes = {
    nav: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
    goToLoginIndex: PropTypes.func.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.nav !== nextProps.nav
  }

  justMessage (message) {
    return (
      <ToolBar>
        <ToolbarGroup>
          <ToolbarTitle text={message}/>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  backButton (message, goBack) {
    return (
      <ToolBar>
        <ToolbarGroup firstChild>
          <FlatButton
            primary
            onTouchTap={goBack}
            icon={<BackIcon />}
            style={{width: 25, margin: 0}}
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <ToolbarTitle text={message}/>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  signinIndex (message, goToLoginIndex) {
    return (
      <ToolBar>
        <ToolbarGroup firstChild>
          <FlatButton
            primary
            onTouchTap={goToLoginIndex}
            icon={<ReturnIcon />}
            style={{width: 25, margin: 0}}
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <ToolbarTitle text={message}/>
        </ToolbarGroup>
      </ToolBar>
    )
  }

  render () {
    /*
     {
     JUST_MESSAGE: null,
     BACK_BUTTON: null,
     RETURN_SIGNIN: null
     }
     */
    const {goBack, goToLoginIndex, nav} = this.props
    const messaage = nav.get('message')
    const buttonState = nav.get('buttonState')
    if (buttonState === buttons.JUST_MESSAGE) {
      return this.justMessage(messaage)
    } else if (buttonState === buttons.BACK_BUTTON) {
      return this.backButton(messaage, goBack)
    } else {
      return this.signinIndex(messaage, goToLoginIndex)
    }
  }
}

export default connect(statToProps, dispatchToProps)(LoginControlTitleButtons)
