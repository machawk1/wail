import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form/immutable'
import { Flex } from 'react-flex'
import FlatButton from 'material-ui/FlatButton'
import { TextField } from 'redux-form-material-ui'
import S from 'string'
import {newCollectionForm} from '../../../constants/uiStrings'

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
      errors.name = newCollectionForm.collNameError
    }
  }

  if (!description) {
    errors.description = 'Required'
  } else {
    if (swapper.setValue(description).isEmpty()) {
      errors.description = newCollectionForm.collDescriptError
    }
  }

  if (!title) {
    errors.title = 'Required'
  }

  return errors
}

const formConfig = {
  form: 'newCollection',
  validate
}

const NewCollectionForm = ({handleSubmit, pristine, reset, submitting, invalid, onSubmit, onCancel}) => (
  <div style={{width: 'inherit', height: 'inherit'}}>
    <form id='newcolform' onSubmit={handleSubmit(onSubmit)} style={{height: '100%'}}>
      <div>
        <Flex row alignContent='center' justifyContent='space-between'>
          <Field
            id='newCol-name'
            name='name'
            component={TextField}
            floatingLabelText={newCollectionForm.collName}
            hintText={newCollectionForm.collNameHint}
          />
          <Field
            id='newCol-title'
            name='title'
            component={TextField}
            floatingLabelText={newCollectionForm.collTitle}
            hintText={newCollectionForm.collTitleHint}
          />
        </Flex>
      </div>
      <div>
        <Field
          id='newCol-decription'
          name='description'
          component={TextField}
          floatingLabelText={newCollectionForm.collDescript}
          hintText={newCollectionForm.collDescriptHint}
          fullWidth
          multiLine
        />
      </div>
      <div style={{height: '40px'}}>
        <FlatButton
          id='newCol-create'
          label={newCollectionForm.createCollection}
          type='submit'
          disabled={invalid || pristine || submitting}
          primary
        />
        <FlatButton
          id='newCol-cancel'
          label={newCollectionForm.cancel}
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
