import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Field, reduxForm } from 'redux-form/immutable'
import { remote, ipcRenderer as ipc } from 'electron'
import { SubmissionError, reset as resetForm } from 'redux-form'
import { batchActions } from 'redux-batched-actions'
import isURL from 'validator/lib/isURL'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import filenamifyUrl from 'filenamify-url'
import { TextField, SelectField } from 'redux-form-material-ui'
import * as notify from '../../../../actions/notification-actions'
import { resetCheckMessage } from '../../../../actions/archival'
import path from 'path'
import S from 'string'
import acronyms from '../../../../constants/acronyms'
import { archiving, ipcChannels } from '../../../../../wail-core/globalStrings'

const settings = remote.getGlobal('settings')

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const archive = (forCol, config) => {
  let message = `Archiving ${config.get('url')} for ${forCol} Now!`
  let conf = config.get('config')
  if (conf.charAt(0) === 'p') {
    let saveThisOne = `${filenamifyUrl(config.get('url'))}-${forCol}-${new Date().getTime()}.warc`
    ipc.send(ipcChannels.ARCHIVE_WITH_WAIL, {
      forCol,
      type: conf,
      uri_r: config.get('url'),
      saveTo: path.join(S(settings.get('collections.colWarcs')).template({col: forCol}).s, saveThisOne),
      isPartOfV: forCol,
      description: `Archived by WAIL for ${forCol}`
    })
  } else {
    ipc.send(ipcChannels.ARCHIVE_WITH_HERITRIX, {
      urls: config.get('url'),
      depth: parseInt(conf[1]),
      jobId: new Date().getTime(),
      forCol
    })
  }
  notify.notifyInfo(message, true)
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

const trans = process.platform === 'win32' ? 'translateY(30px)' : 'translateY(20px)'

class ArchiveUrlForm extends Component {
  constructor (...args) {
    super(...args)
    this.submit = this.submit.bind(this)
  }

  submit (values) {
    if (!values.get('config')) {
      throw new SubmissionError({config: 'Config Not Present', _error: 'Cant Archive'})
    } else {
      archive(this.props.col, values)
      this.props.dispatch(batchActions([resetForm(formConfig.form), resetCheckMessage()]))
    }
  }

  render () {
    const {handleSubmit, pristine, reset, submitting, invalid} = this.props
    return (
      <div style={{width: '90%', height: 'inherit', marginTop: 15}}>
        <form id='addSeedFromLiveWebForm' onSubmit={handleSubmit(this.submit)} style={{height: '300px'}}>
          <div style={{height: '75px'}}>
            <Field
              id='urlInput'
              name='url'
              component={TextField}
              floatingLabelText='Seed To Add'
              hintText={acronyms.url}
              fullWidth
              style={{marginLeft: 25, marginRight: 25}}
            />
          </div>
          <div style={{height: '175px', width: '310px'}}>
            <Field
              id='archiveConfig'
              name='config'
              component={SelectField}
              hintText='Archive Configuration'
              floatingLabelText='Archive Configuration'
              style={{marginLeft: 25, width: '310px'}}
            >
              <MenuItem id='po' value={archiving.PAGE_ONLY} primaryText='Page Only'/>
              <MenuItem id='psd' value={archiving.PAGE_SAME_DOMAIN} primaryText='Page + Same Domain Links'/>
              <MenuItem id='pal' value={archiving.PAGE_ALL_LINKS} primaryText='Page + All Links'/>
              <MenuItem id='h0' value={archiving.HERITRIX_DEPTH_1} primaryText='Heritrix Depth 1'/>
              <MenuItem id='h1' value={archiving.HERITRIX_DEPTH_2} primaryText='Heritrix Depth 2'/>
              <MenuItem id='h2' value={archiving.HERITRIX_DEPTH_3} primaryText='Heritrix Depth 3'/>
            </Field>
          </div>
          <div id='archiveFormButtons' style={{height: '40px', transform: trans}}>
            <FlatButton
              id='archiveNowButton'
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

ArchiveUrlForm.propTypes = {
  col: PropTypes.string.isRequired
}

export default reduxForm(formConfig)(ArchiveUrlForm)
