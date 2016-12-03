import React, {Component, PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form/immutable'
import {Flex} from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import {TextField} from 'redux-form-material-ui'
import S from 'string'

const validate = values => {
  const errors = {}
  let swapper = S('')
  let name = values.get('name')
  let description = values.get('description')
  let title = values.get('title')

  if (!name) {
    errors.name = 'Required'
  } else {
    if (swapper.setValue(name).trim().contains(' ')) {
      errors.name = 'Collection names can not contain spaces'
    }
  }

  if (!description) {
    errors.description = 'Required'
  } else {
    if (swapper.setValue(description).isEmpty()) {
      errors.name = 'Collection names can not contain spaces'
    }
  }

  if (!title) {
    errors.title = 'Required'
  }

  return errors
}

const formConfig = {
  form: 'newCollection',
  validate,
}

const NewCollectionForm = ({ handleSubmit, pristine, reset, submitting, invalid, onSubmit, onCancel }) => (
  <div style={{ width: 'inherit', height: 'inherit' }}>
    <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
      <div>
        <Flex row alignContent='center' justifyContent='space-between'>
          <Field
            name='name'
            component={TextField}
            floatingLabelText='Collection Name'
            hintText='MyAwesomeCollection'
          />
          <Field
            name='title'
            component={TextField}
            floatingLabelText='Collection Title'
            hintText='Awesome Collection'
          />
        </Flex>
      </div>
      <div>
        <Field
          name='description'
          component={TextField}
          floatingLabelText='Collection Description'
          hintText='Really Awesome Collection'
          fullWidth
          multiLine
        />
      </div>
      <div style={{ height: '40px' }}>
        <FlatButton
          label='Create Collection'
          type='submit'
          disabled={invalid || pristine || submitting}
          primary
        />
        <FlatButton
          label='Cancel'
          onTouchTap={onCancel}
        />
      </div>
    </form>
  </div>
)

NewCollectionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default reduxForm(formConfig)(NewCollectionForm)
