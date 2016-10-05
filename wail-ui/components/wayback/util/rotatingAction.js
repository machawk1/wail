import React, {Component, PropTypes} from 'react'
import IconButton from 'material-ui/IconButton'
import Apps from 'material-ui/svg-icons/navigation/apps'
import shallowCompare from 'react-addons-shallow-compare'

const open = { transform: 'rotate(45deg)' }
const closed = {}

export default class RotatingAction extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      opened: false
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let { opened } = this.state
    return (
      <IconButton
        tooltipPosition='top-center'
        tooltip='Actions'
        onTouchTap={() => {
          console.log('clicked actions')
          this.setState({ opened: !this.state.opened })
        }}
        iconStyle={opened ? open : closed}
      >
        <Apps/>
      </IconButton>
    )
  }

}
