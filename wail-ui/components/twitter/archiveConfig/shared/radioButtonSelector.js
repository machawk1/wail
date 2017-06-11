import PropTypes from 'prop-types'
import React, { Component } from 'react'
import CardHeader from 'material-ui/Card/CardHeader'
import pure from 'recompose/pure'
import { RadioButtonGroup } from 'material-ui/RadioButton'

export default class RadioButtonSelector extends Component {
  static propTypes = {
    divStyle: PropTypes.object,
    title: PropTypes.string.isRequired
  }

  static defaultProps = {
    divStyle: {
      width: '50%'
    }
  }

  constructor (...args) {
    super(...args)
    this.onChange = this.onChange.bind(this)
  }

  onChange (event, value) {
    this.props.input.onChange(value)
  }

  render () {
    let {input, divStyle, title, ...rest} = this.props
    return (
      <div style={{
        marginLeft: 10
      }}>
        <CardHeader title={title} />
        <RadioButtonGroup
          style={{width: 200}}
          {...input}
          {...rest}
          valueSelected={input.value}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

// export default pure(RadioButtonSelector)
