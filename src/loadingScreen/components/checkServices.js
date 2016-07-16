import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'

export default class CheckServices extends Component {
  static propTypes = {
    checkServices: PropTypes.func.isRequired,
  }

  constructor (props, context) {
    super()
    this.state = {
      checkENV: false,
      checkedVersion: false,
      haveENV: false,
      haveRequeiredVersion: false,
    }
  }

  render () {
    return (
      <p>
        hi ;)
      </p>
    )
  }
}
