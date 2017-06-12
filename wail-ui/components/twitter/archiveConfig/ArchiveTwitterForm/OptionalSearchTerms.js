import React from 'react'
import pure from 'recompose/pure'
import { FieldArray } from 'redux-form/immutable'
import SearchTermList from './SearchTermList'

function OptionalSearchTerms () {
  return (
    <FieldArray name='searchT' component={SearchTermList}/>
  )
}


export default pure(OptionalSearchTerms)
