import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Checkbox from 'material-ui/Checkbox'

export default class CheckBox extends Component {
  static propTypes = {
    cboxKey: PropTypes.string,
    onCheck: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired
  }

  static defaultProps = {
    cboxKey: 'AdvancedCheckBox',
    checked: false
  }

  constructor (props) {
    super(props)
    this.state = {
      checked: props.checked
    }
  }

  render () {
    return (
      <Checkbox
        checked={this.state.checked}
        key={this.props.cboxKey}
        onCheck={(e, checked) => {
          this.setState({ checked }, () => {
            this.props.onCheck(checked)
          })
        }}
      />
    )
  }
}
