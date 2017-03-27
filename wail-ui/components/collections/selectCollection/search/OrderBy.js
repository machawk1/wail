import React, { Component, PropTypes } from 'react'
import { BehaviorSubject } from 'rxjs'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

export default class OrderBy extends Component {
  static propTypes = {
    orderSubject: PropTypes.instanceOf(BehaviorSubject).isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      value: null
    }
  }

  handleChange (event, index, value) {
    this.setState({value}, () => {
      this.props.orderSubject.next(value)
    })
  }

  render () {
    return (
      <SelectField
        style={{width: '25%', height: '55px'}}
        floatingLabelText='Order By?'
        value={this.state.value}
        onChange={::this.handleChange}
      >
        <MenuItem value={'colName'} primaryText='Collection Name' />
        <MenuItem value={'seeds'} primaryText='Number Of Seeds' />
        <MenuItem value={'size'} primaryText='Size' />
      </SelectField>
    )
  }
}
