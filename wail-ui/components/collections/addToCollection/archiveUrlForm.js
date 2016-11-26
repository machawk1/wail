import React, {Component, PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form/immutable'
import Promise from 'bluebird'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import {Card, CardHeader, CardTitle, CardText, CardMedia, CardActions} from 'material-ui/Card'
import {SubmissionError} from 'redux-form'
import isURL from 'validator/lib/isURL'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import {RadioButton} from 'material-ui/RadioButton'
import {
  Checkbox,
  RadioButtonGroup,
  SelectField,
  TextField,
  Toggle
} from 'redux-form-material-ui'
const styles = {
  block: {
    maxWidth: 250
  },
  radioButton: {
    marginBottom: 16
  },
  paperStyle: {
    width: 300,
    margin: 'auto',
    padding: 20
  },
  switchStyle: {
    marginBottom: 16
  },
  submitStyle: {
    marginTop: 32
  }

}

const validate = values => {
  console.log('validate', values)
  const errors = {}
  if (!values.get('url')) {
    errors.url = 'Required'
  } else {
    if (!isURL(values.get('url'))) {
      errors.url = 'Not a url'
    }
  }
  if (!values.get('config')) {
    errors.config = 'Must select one'
  }
  return errors
}
const warn = values => {
  const warnings = {}
  if (!values.get('config')) {
    warnings.config = 'Required'
  }
  return warnings
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function submit (values) {
  return sleep(1000) // simulate server latency
    .then(() => {
      console.log('in submit', values)
      if (!values.config) {
        throw new SubmissionError({ config: 'Config Not Present', _error: 'Cant Archive' })
      } else {
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
      }
    })
}

const formConfig = {
  form: 'archiveUrl',  // a unique identifier for this form
  validate,
  warn
}

class ArchiveUrlForm extends Component {
  render () {
    console.log('in form', this.props)
    const { handleSubmit, pristine, reset, submitting, invalid } = this.props
    return (
      <div style={{ width: '90%', height: 'inherit' }}>
        <form onSubmit={handleSubmit(submit)} style={{ height: '300px' }}>
          <div>
            <Field name='url' component={TextField}
                   floatingLabelText='Seed to add:'
                   hintText='Url'
                   fullWidth
                   style={{ marginLeft: 25, marginRight: 25 }}
            />
          </div>
          <div style={{ width: '400px', height: '200px' }}>
            <Field name='config' component={RadioButtonGroup}
                   props={{ defaultSelected: 'single-page' }}
                   style={{ marginLeft: 25, marginTop: 10, marginBottom: 20 }}
            >
              <RadioButton
                style={{ marginTop: 10, marginBottom: 10 }}
                value='single-page'
                label='Page Only'
              />
              <RadioButton
                style={{ marginTop: 10, marginBottom: 10 }}
                value='page-same-domain'
                label='Page and internal (same domain) links'
              />
              <RadioButton
                style={{ marginTop: 10, marginBottom: 10 }}
                value='page-same-domain-external'
                label='Page and all (internal and external) links'
              />
            </Field>
          </div>
          <div>
            <FlatButton
              label='Add and Archive Now'
              type='submit'
              disabled={invalid || pristine || submitting}
              primary
            />
            <FlatButton label='Cancel' disabled={pristine || submitting} onTouchTap={reset}/>
          </div>
        </form>
      </div>
    )
  }
}

export default reduxForm(formConfig)(ArchiveUrlForm)
