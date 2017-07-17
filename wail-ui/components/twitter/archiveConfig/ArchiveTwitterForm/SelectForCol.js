import React, { Component } from 'react'
import { Field } from 'redux-form/immutable'
import { SelectField } from 'redux-form-material-ui'

export default class SelectForCol extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.cols !== nextProps.cols
  }

  render () {
    const {cols} = this.props
    return (
      <Field
        name='forCol'
        floatingLabelText='For Collection'
        component={SelectField}
        dropDownMenuProps={{
          maxHeight: 300,
          anchorOrigin: {vertical: 'top', horizontal: 'left'}
        }}
      >
        {cols}
      </Field>
    )
  }
}
