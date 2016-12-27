import React, {Component, PropTypes} from 'react'
import AppBar from 'material-ui/AppBar'
import CrawlIndicator from './crawlingIndicator'
import {connect} from 'react-redux'
import {toggle} from '../../actions/header'

const stateToProp = state => ({
  location: state.get('header').get('location')
})

const dispatchToProp = dispatch => ({
  handleToggle () {
    dispatch(toggle())
  }
})

class AppBar_ extends Component {
  static propTypes = {
    location: PropTypes.string.isRequired,
    handleToggle: PropTypes.func.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.location !== nextProps.location
  }

  render () {
    return (
      <AppBar
        title={this.props.location}
        onLeftIconButtonTouchTap={this.props.handleToggle}
        iconElementRight={<CrawlIndicator />}
      />
    )
  }
}

export default connect(stateToProp, dispatchToProp)(AppBar_)
