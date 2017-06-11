import React, { Component } from 'react'
import PropTypes from 'prop-types'
import constz from '../../constants'
import LoginControlTitleButtons from './LoginControlTitleButtons'

export default class LoginControl extends Component {
  static propTypes = {
    webview: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.goBack = this.goBack.bind(this)
    this.goForwards = this.goForwards.bind(this)
    this.goToLoginIndex = this.goToLoginIndex.bind(this)
    this.gb = {type: constz.WENT_BACK_TO_LOGIN}
    this.noop = {type: constz.NOOP}
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.webview !== nextProps.webview
  }

  goBack () {
    let wbv = this.props.webview.get('wbv')
    if (wbv.canGoBack()) {
      wbv.goBack()
      return this.gb
    }
    return this.noop
  }

  goToLoginIndex () {
    let wbv = this.props.webview.get('wbv')
    try {
      wbv.goToIndex(0)
      return this.gb
    } catch (error) {
      return this.noop
    }
  }

  goForwards () {
    let wbv = this.props.webview.get('wbv')
    if (wbv.canGoForward()) {
      wbv.goForward()
    }
  }

  render () {
    return (
      <div className="loginControlContainer">
        <LoginControlTitleButtons goBack={this.goBack} goToLoginIndex={this.goToLoginIndex}/>
      </div>
    )
  }
}

