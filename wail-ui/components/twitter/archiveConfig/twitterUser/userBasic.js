import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Field, reduxForm } from 'redux-form/immutable'
import { TextField, AutoComplete, SelectField } from 'redux-form-material-ui'
import fuzzyFilter from '../../../../util/fuzzyFilter'
import validate from './validate'

const formConfig = {
  form: 'aTwitterUser',  // a unique identifier for this form,
  destroyOnUnmount: false,
  validate
}

class UserBasic extends Component {
  static propTypes = {
    cols: PropTypes.array.isRequired,
    times: PropTypes.array.isRequired
  }

  render () {
    const {handleSubmit, pristine, reset, submitting, invalid, cols, times} = this.props
    return (
      <form onSubmit={handleSubmit} style={{marginLeft: 10, height: '100%'}}>
        <div style={{height: 72}}>
          <Field
            hintText='How Long To Monitor'
            name='length'
            component={SelectField}
            maxHeight={200}
          >
            {times}
          </Field>
        </div>
        <div style={{height: 72}}>
          <Field
            floatingLabelText='ScreenName'
            hintText='WebSciDl'
            name='screenName'
            component={TextField}
            style={{marginTop: 0}}
          />
        </div>
        <div style={{height: 72}}>
          <Field
            floatingLabelText='For Collection'
            name='forCol'
            component={AutoComplete}
            dataSource={cols}
            menuProps={{desktop: true, maxHeight: 110}}
            openOnFocus
            maxSearchResults={10}
            filter={fuzzyFilter}
          />
        </div>
        <CardActions>
          <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary />
        </CardActions>
      </form>
    )
  }
}

export default reduxForm(formConfig)(UserBasic)
