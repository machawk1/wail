import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

const stateToProp = state => ({
  location: state.get('header').get('location')
})

class Location extends Component {
  static propTypes = {
    location: PropTypes.string.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.location !== nextProps.location
  }

  render () {
    let loc = this.props.location
    return (
      {loc}
    )
  }

}

export default connect(stateToProp)(Location)