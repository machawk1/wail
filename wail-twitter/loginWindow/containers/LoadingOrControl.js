import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoadingLogin from '../components/LoadingLogin'
import LoadingControl from '../components/LoginControls'

function stateToProps (state) {
  return {webview: state.get('webview')}
}

class LoadingOrControl extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.webview !== nextProps.webview
  }

  render () {
    let webview = this.props.webview
    return (
      webview.get('ready') ? (
        <LoadingControl webview={webview} />
      ) : (
        <LoadingLogin />
      )
    )
  }
}

export default connect(stateToProps)(LoadingOrControl)
