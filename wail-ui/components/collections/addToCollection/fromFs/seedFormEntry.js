import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form/immutable'
import { RadioButtonGroup } from 'redux-form-material-ui'
import MyAutoSizer from '../../../utilComponents/myAutoSizer'

export default class SeedFormEntry extends Component {
  static propTypes = {
    containerName: PropTypes.string.isRequired,
    seeds: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.renderField = this.renderField.bind(this)
  }

  renderField ({height}) {
    return (
      <Field
        style={{marginLeft: 10, overflowY: 'auto', width: '97%', height, maxHeight: height - 370}}
        name={this.props.name}
        component={RadioButtonGroup}
      >
        {this.props.seeds}
      </Field>
    )
  }

  render () {
    return (
      <MyAutoSizer findElement={this.props.containerName}>
        {this.renderField}
      </MyAutoSizer>
    )
  }
}
