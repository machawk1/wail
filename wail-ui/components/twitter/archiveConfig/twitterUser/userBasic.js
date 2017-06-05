import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Field, reduxForm } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import validate from './validate'
import ForColAndLength from '../shared/forColAndLength'

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
      <form onSubmit={handleSubmit} className="widthHeightHundoPercent">
        <div className="twitterScreenNameDiv">
          <Field
            floatingLabelText='ScreenName'
            hintText='WebSciDl'
            name='screenName'
            component={TextField}
            fullWidth={true}
          />
        </div>
        <ForColAndLength cols={cols} times={times}/>
        <CardActions className="archiveTwitterButtons">
          <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary/>
        </CardActions>
      </form>
    )
  }
}

export default reduxForm(formConfig)(UserBasic)
