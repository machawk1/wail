import React, {Component, PropTypes} from 'react'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {ListItem} from 'material-ui/List'
import autobind from 'autobind-decorator'

export default class CheckJava extends Component {
  static propTypes = {
    checkJava: PropTypes.func.isRequired,
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
