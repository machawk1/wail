import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {Card, CardText, CardTitle} from 'material-ui/Card'
import moment from 'moment/moment'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import {List, ListItem} from 'material-ui/List'
import AddIcon from  'material-ui/svg-icons/content/add'
import {Field, FieldArray, reduxForm} from 'redux-form/immutable'
import {Flex, Item} from 'react-flex'
import {
  TimePicker,
  TextField
} from 'redux-form-material-ui'

const validate = values => {
  console.log('validate', values)
  const errors = {}
  let until = values.get('until')
  if (!until) {
    errors.until = 'Required'
  } else {
    if (until === '') {
      errors.until = 'Must Choose Stopping Time'
    } else {
      let now = moment()
      if (moment(until).isBefore(moment())) {
        errors.until = `Until Must be after time now ${now.format('h:mma')}`
      }
    }
  }
  return errors
}
const warn = values => {
  const warnings = {}
  if (!values.get('until')) {
    warnings.until = 'Required'
  }
  return warnings
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function submit (values) {
  return sleep(1000) // simulate server latency
    .then(() => {
      console.log('in submit', values)
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
    })
}

const formConfig = {
  form: 'aTwitterUser',  // a unique identifier for this form
  validate,
  warn
}

const hashtagRender = ({ fields, meta: { touched, error } }) => {
  return (
    <div>
      <RaisedButton onTouchTap={() => fields.push('')} primary label={'#Add'} labelPosition={'before'}/>
      <List style={{ height: 300, maxHeight: 300, overFlowY: 'auto' }}>
        {
          fields.map((ht, index) =>
            <ListItem
              key={index}
              primaryText={
                <Field
                  hintText='#webscidl'
                  name={`${ht}`}
                  component={TextField}
                  defaultTime={null}
                />
              }
            />)
        }
      </List>
    </div>
  )
}

class HashTags extends Component {
  render () {
    const { handleSubmit, pristine, reset, submitting, invalid } = this.props
    return (
      <div style={{ width: '100%', height: '100%' }} id='twitterArchive'>
        <Card style={{ width: '100%', height: '100%' }}>

          <form onSubmit={handleSubmit(submit)} style={{ width: 'inherit', height: 'inherit' }}>
            <Field
              name='Until'
              component={TimePicker}
              defaultTime={null}
            />
            <div style={{ maxHeight: 'calc(100% - 300px)', overflowY: 'auto' }}>
              <FieldArray name="hashtags" component={hashtagRender}/>
            </div>
            <div>
              <FlatButton label='Add and Archive Now' type='submit' disabled={ pristine || submitting}
                          primary/>
              <FlatButton label='Cancel' disabled={pristine || submitting} onTouchTap={reset}/>
            </div>
          </form>
        </Card>
      </div>
    )
  }
}

export default reduxForm(formConfig)(HashTags)