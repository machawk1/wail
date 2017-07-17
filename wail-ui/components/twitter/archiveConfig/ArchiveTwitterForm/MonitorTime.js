import React from 'react'
import { Field } from 'redux-form/immutable'
import { SelectField } from 'redux-form-material-ui'
import pure from 'recompose/pure'

export default function MonitorTime ({times}) {
  return (
    <Field
      name='length'
      floatingLabelText='How Long To Monitor'
      component={SelectField}
      dropDownMenuProps={{
        maxHeight: 200,
        anchorOrigin: {vertical: 'top', horizontal: 'left'}
      }}
    >
      {times}
    </Field>
  )
}
