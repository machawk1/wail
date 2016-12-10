import React, {Component, PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form/immutable'
import {ipcRenderer as ipc} from 'electron'
import {SubmissionError, reset as resetForm} from 'redux-form'
import {batchActions} from 'redux-batched-actions'
import isURL from 'validator/lib/isURL'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import {TextField, SelectField} from 'redux-form-material-ui'
import * as notify from '../../../../actions/notification-actions'
import {resetCheckMessage} from '../../../../actions/redux/archival'

const archive = (forCol, config) => {
  let message = `Archiving ${config.get('url')} for ${forCol} Now!`
  let jId = new Date().getTime()
  notify.notifyInfo(message)
  ipc.send('makeHeritrixJobConf', { urls: config.get('url'), depth: config.get('config'), jobId: jId, forCol })
  window.logger.debug(message)
}

const validate = values => {
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

const formConfig = {
  form: 'archiveUrl',
  validate
}

class ArchiveUrlForm extends Component {
  static propTypes = {
    col: PropTypes.string.isRequired
  }

  submit (values) {
    if (!values.get('config')) {
      throw new SubmissionError({ config: 'Config Not Present', _error: 'Cant Archive' })
    } else {
      archive(this.props.col, values)
      this.props.dispatch(batchActions([ resetForm(formConfig.form), resetCheckMessage() ]))
    }
  }

  render () {
    const { handleSubmit, pristine, reset, submitting, invalid } = this.props
    return (
      <div style={{ width: '90%', height: 'inherit' }}>
        <form onSubmit={handleSubmit(::this.submit)} style={{ height: '300px' }}>
          <div style={{ height: '75px' }}>
            <Field
              name='url'
              component={TextField}
              floatingLabelText='Seed to add:'
              hintText='Url'
              fullWidth
              style={{ marginLeft: 25, marginRight: 25 }}
            />
          </div>
          <div style={{ height: '175px', width: '310px' }}>
            <Field
              name='config'
              component={SelectField}
              hintText='Archive Configuration'
              floatingLabelText='Archive Configuration'
              style={{ marginLeft: 25, width: '310px' }}
            >
              <MenuItem value={1} primaryText='Page Only' />
              <MenuItem value={2} primaryText='Page + Same domain links' />
              <MenuItem value={3} primaryText='Page + All internal and external links' />
            </Field>
          </div>
          <div style={{ height: '40px', transform: 'translateY(20px)' }}>
            <FlatButton
              label='Add and Archive Now'
              type='submit'
              disabled={invalid || pristine || submitting}
              primary
            />
            <FlatButton label='Cancel' disabled={pristine || submitting} onTouchTap={reset} />
          </div>
        </form>
      </div>
    )
  }
}

export default reduxForm(formConfig)(ArchiveUrlForm)
