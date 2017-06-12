import React from 'react'
import { Field } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import pure from 'recompose/pure'

function InputName () {
  return (
    <Field
      floatingLabelText='ScreenName'
      hintText='WebSciDl'
      name='screenName'
      component={TextField}
    />
  )
}

export default pure(InputName)
