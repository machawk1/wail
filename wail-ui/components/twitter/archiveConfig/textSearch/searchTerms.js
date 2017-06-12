import React from 'react'
import FlatButton from 'material-ui/FlatButton'
import CardActions from 'material-ui/Card/CardActions'
import { FieldArray, reduxForm } from 'redux-form/immutable'
import SearchTermList from './SearchTermList'
import validate from './validate'

const formConfig = {
  destroyOnUnmount: false,
  form: 'twitterTextSearch',  // a unique identifier for this form
  validate
}

function SearchTerms ({handleSubmit, pristine, reset, submitting, invalid, previousPage}) {
  return (
    <form id='tweetTerms' onSubmit={handleSubmit} style={{width: 'inherit', height: 'inherit'}}>
      <div style={{maxHeight: 'calc(100% - 300px)'}}>
        <FieldArray name='searchT' component={SearchTermList}/>
      </div>
      <CardActions className='archiveTwitterButtons'>
        <FlatButton label='Previous' onTouchTap={previousPage}/>
        <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary/>
      </CardActions>
    </form>
  )
}

export default reduxForm(formConfig)(SearchTerms)
