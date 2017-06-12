import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Form, FieldArray, reduxForm } from 'redux-form/immutable'
import CardHeader from 'material-ui/Card/CardHeader'
import validate from './validate'
import SelectForCol from './SelectForCol'
import InputName from './InputName'
import { Flex, Item } from 'react-flex'
import OptionalFields from './OptionalFields'
import OptionalSearchTerms from './OptionalSearchTerms'
import MonitorTime from './MonitorTime'

const formConfig = {
  form: 'archiveTwitter',  // a unique identifier for this form,
  destroyOnUnmount: true,
  immutableProps: ['cols'],
  validate
}

function ArchiveTwitterForm ({handleSubmit, pristine, reset, submitting, invalid, cols, times}) {
  return (
    <Form onSubmit={handleSubmit} style={{width: '100%', height: '100%'}}>
      <CardHeader title='Required' style={{paddingBottom: 0}}/>
      <Flex row justifyContent='space-around'>
        <InputName />
        <SelectForCol cols={cols}/>
        <MonitorTime times={times}/>
      </Flex>
      <CardActions className="archiveTwitterButtons">
        <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary/>
        <FlatButton label='Clear' onTouchTap={reset}/>
      </CardActions>
    </Form>
  )
}

export default reduxForm(formConfig)(ArchiveTwitterForm)
