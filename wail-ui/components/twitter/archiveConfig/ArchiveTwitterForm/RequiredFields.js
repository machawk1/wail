import React from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Form, reduxForm } from 'redux-form/immutable'
import CardHeader from 'material-ui/Card/CardHeader'
import validate from './validate'
import SelectForCol from './SelectForCol'
import InputName from './InputName'
import Flexbox from 'flexbox-react'
import MonitorTime from './MonitorTime'

const formConfig = {
  form: 'archiveTwitter',  // a unique identifier for this form,
  destroyOnUnmount: false,
  immutableProps: ['cols'],
  validate
}

function RequiredFields ({handleSubmit, pristine, reset, submitting, invalid, cols, times}) {
  return (
    <Form onSubmit={handleSubmit} className='inheritThyWidthHeight'>
      <CardHeader title='Required' />
      <Flexbox
        flexDirection='row'
        flexWrap='wrap' justifyContent='space-around' style={{height: 152}}>
        <InputName />
        <SelectForCol cols={cols} />
        <MonitorTime times={times} />
      </Flexbox>
      <CardActions className='archiveTwitterButtons'>
        <FlatButton label='Next' type='submit' primary />
      </CardActions>
    </Form>
  )
}

export default reduxForm(formConfig)(RequiredFields)
