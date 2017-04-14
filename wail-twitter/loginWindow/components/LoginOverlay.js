import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import onlyUpdateFromKeys from 'recompose/onlyUpdateForKeys'
import toggle from '../actions'

const stateToProps = state => ({
  overlay: state.get('overlay')
})

const dispatchToProps = dispatch => bindActionCreators({doToggle: toggle}, dispatch)

const enhance = onlyUpdateFromKeys(['overlay'])

function LoginOverlay ({overlay, doToggle}) {
  let className = overlay.get('open') ? 'loverlay' : 'loverlayc'
  return (
    <div className={className}>
      <a href='javascript:void(0)' className='closebtn' onClick={doToggle}>&times;</a>
      <div className='loverlay-content'>
        <a href='#'>An Error Occurred During Sign In. The Username or Password is incorrect</a>
      </div>
    </div>
  )
}

LoginOverlay.propTypes = {
  overlay: PropTypes.instanceOf(Map).isRequired,
  doToggle: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(enhance(LoginOverlay))
