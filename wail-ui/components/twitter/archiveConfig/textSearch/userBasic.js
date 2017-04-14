import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {CardActions} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {Field, reduxForm} from 'redux-form/immutable'
import {TextField, AutoComplete} from 'redux-form-material-ui'
import fuzzyFilter from '../../../../util/fuzzyFilter'
import timeVales from '../timeValues'
import validate from './validate'

const formConfig = {
  form: 'twitterTextSearch',  // a unique identifier for this form,
  destroyOnUnmount: false,
  validate
}

class UserBasic extends Component {
  static propTypes = {
    cols: PropTypes.array.isRequired
  }

  render () {
    const { handleSubmit, previousPage, cols } = this.props
    return (
      <form onSubmit={handleSubmit} style={{ marginLeft: 16 }}>
        <div style={{height: 72}}>
          <Field
            floatingLabelText='How Long To Monitor'
            name='length'
            component={AutoComplete}
            dataSource={timeVales.times}
            menuProps={{ desktop: true, maxHeight: 110 }}
            openOnFocus
            filter={fuzzyFilter}
          />
        </div>
        <div style={{height: 72}}>
          <Field
            floatingLabelText='ScreenName'
            hintText='WebSciDl'
            name='screenName'
            component={TextField}
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
          <FlatButton label='Next' type='submit' primary />
        </CardActions>
      </form>
    )
  }
}

export default reduxForm(formConfig)(UserBasic)
