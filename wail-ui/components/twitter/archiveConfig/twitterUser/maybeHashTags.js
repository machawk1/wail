import React, {Component, PropTypes} from 'react'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import {List, ListItem} from 'material-ui/List'
import {CardActions, CardTitle} from 'material-ui/Card'
import {Field, FieldArray, reduxForm} from 'redux-form/immutable'
import {TextField} from 'redux-form-material-ui'
import IconButton from 'material-ui/IconButton'
import {Flex, Item} from 'react-flex'
import Remove from 'material-ui/svg-icons/content/remove-circle'
import validate from './validate'

const formConfig = {
  destroyOnUnmount: false,
  form: 'aTwitterUser',  // a unique identifier for this form
  validate
}

const hashtagRender = ({ fields, meta: { touched, error } }) => {
  return (
    <div>
      <Flex row alignItems='center'>
        <CardTitle subtitle='Look For Hashtags? (optional)' />
        <RaisedButton
          onTouchTap={() => fields.push('')}
          primary label={'#Add'}
          labelPosition={'before'}
        />
      </Flex>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 300px)' }}>
        <List style={{ height: 300, maxHeight: 300 }}>
          {
            fields.map((ht, index) =>
              <ListItem
                key={index}
                rightIconButton={
                  <IconButton onTouchTap={() => fields.remove(index)}>
                    <Remove />
                  </IconButton>
                }
                primaryText={
                  <Field
                    hintText='#webscidl'
                    name={`${ht}`}
                    component={TextField}
                  />
                }
              />)
          }
        </List>
      </div>
    </div>
  )
}

class HashTags extends Component {
  render () {
    const { handleSubmit, pristine, reset, submitting, invalid, previousPage } = this.props
    return (
      <form onSubmit={handleSubmit} style={{ width: 'inherit', height: 'inherit' }}>
        <div style={{ maxHeight: 'calc(100% - 300px)' }}>
          <FieldArray name='hashtags' component={hashtagRender} />
        </div>
        <CardActions>
          <FlatButton label='Previous' onTouchTap={previousPage} />
          <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary />
        </CardActions>
      </form>
    )
  }
}

export default reduxForm(formConfig)(HashTags)
