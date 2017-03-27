import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/Dialog'
import {Map} from 'immutable'
import { connect } from 'react-redux'

const stateToProps = state => ({closing: state.get('closing')})

class WailClosing extends Component {
  static propTypes = {
    closing: PropTypes.instanceOf(Map)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.closing !== nextProps.closing
  }

  render () {
    return (
      <Dialog
        modal
        open={this.props.closing.get('isClosing')}
      >
        WAIL is shutting down
      </Dialog>
    )
  }
}

export default connect(stateToProps)(WailClosing)
