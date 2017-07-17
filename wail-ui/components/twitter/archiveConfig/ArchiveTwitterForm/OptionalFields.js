import React from 'react'
import CardHeader from 'material-ui/Card/CardHeader'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Form, reduxForm } from 'redux-form/immutable'
import { FieldArray } from 'redux-form/immutable'
import SearchTermList from './SearchTermList'
import validate from './validate'

const formConfig = {
  form: 'archiveTwitter',  // a unique identifier for this form,
  destroyOnUnmount: false,
  validate
}

function OptionalFields ({handleSubmit, pristine, previousPage, reset, submitting, invalid}) {
  return (
    <Form onSubmit={handleSubmit} className='inheritThyWidthHeight'>
      <CardHeader title='Optional' />
      <FieldArray name='searchT' component={SearchTermList} />
      <CardActions>
        <FlatButton label='Previous' onTouchTap={previousPage} />
        <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary />
        <FlatButton label='Clear' onTouchTap={reset} />
      </CardActions>
    </Form>
  )
}

export default reduxForm(formConfig)(OptionalFields)
