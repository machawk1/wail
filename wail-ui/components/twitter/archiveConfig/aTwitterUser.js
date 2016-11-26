import React, {Component, PropTypes} from 'react'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {Field, reduxForm} from 'redux-form/immutable'
import {send} from 'redux-electron-ipc'
import {SubmissionError} from 'redux-form'
import {TextField, AutoComplete} from 'redux-form-material-ui'
import fuzzyFilter from '../../../util/fuzzyFilter'
import timeVales from './timeValues'

const log = ::console.log

function validate (values) {
  log('validate', values.toJS())
  let errors = {}
  let length = values.get('length')
  if (!length) {
    console.log('no length')
    errors.length = 'Must Choose Time Unit'
  } else {
    if (!timeVales.values[ length ]) {
      errors.length = 'Must Choose Time Unit'
      log('empty')
    }
  }

  if (!values.get('screenName')) {
    errors.screenName = 'Screen Name Required'
  }

  if (!values.get('forCol')) {
    errors.forCol = 'Collection Required'
  }
  return errors
}

const formConfig = {
  form: 'aTwitterUser',  // a unique identifier for this form
  validate
}

class ATwitterUser extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  submit (values) {
    return global.twitterClient.getUserId({ screen_name: values.get('screenName') })
      .catch(error => {
        console.error(error)
      })
      .then(({ data, resp }) => {
        if (data.errors) {
          throw new SubmissionError({
            userName: `${values.get('userName')} does not exist`,
            _error: 'Invalid Screen Name'
          })
        }
        let config = {
          account: values.get('screenName'),
          dur: timeVales.values[ values.get('length') ],
          forCol: values.get('forCol')
        }
        console.log(config)
        this.context.store.dispatch(send('monitor-twitter-account', config))
      })
  }

  collectionNames () {
    return Array.from(this.context.store.getState().get('collections').values())
      .map((col, i) => col.get('colName'))
  }

  render () {
    const { handleSubmit, pristine, reset, submitting, invalid } = this.props
    let cols = this.collectionNames()
    return (
      <div style={{ width: '100%', height: '100%' }} id='twitterArchive'>
        <Card>
          <CardTitle title={'User Your Are Following'}/>
          <form onSubmit={handleSubmit(::this.submit)} style={{ marginLeft: 16 }}>
            <div>
              <Field
                floatingLabelText='How Long To Monitor'
                name='length'
                component={AutoComplete}
                dataSource={timeVales.times}
                menuProps={{ desktop: true }}
                openOnFocus
                maxSearchResults={10}
                filter={fuzzyFilter}
              />
            </div>
            <div>
              <Field
                floatingLabelText='ScreenName'
                hintText='WebSciDl'
                name='screenName'
                component={TextField}
              />
            </div>
            <div>
              <Field
                floatingLabelText='For Collection'
                name='forCol'
                component={AutoComplete}
                dataSource={cols}
                menuProps={{ desktop: true }}
                openOnFocus
                maxSearchResults={10}
                filter={fuzzyFilter}
              />
            </div>
            <CardActions>
              <FlatButton label='Start' type='submit' disabled={ pristine || submitting} primary/>
              <FlatButton label='Cancel' disabled={pristine || submitting} onTouchTap={reset}/>
            </CardActions>
          </form>
        </Card>
      </div>
    )
  }
}

export default reduxForm(formConfig)(ATwitterUser)