import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import { List, ListItem } from 'material-ui/List'
import { CardActions, CardTitle } from 'material-ui/Card'
import { Field, FieldArray, reduxForm } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import IconButton from 'material-ui/IconButton'
import Flexbox from 'flexbox-react'
import Remove from 'material-ui/svg-icons/content/remove-circle'
import validate from './validate'

const formConfig = {
  destroyOnUnmount: false,
  form: 'aTwitterUser',  // a unique identifier for this form
  validate
}

class HashTags extends Component {
  constructor (...args) {
    super(...args)
    this.addField = this.addField.bind(this)
    this.makeLis = this.makeLis.bind(this)
  }

  addField () {
    this.props.fields.push('')
  }

  makeLis () {
    let i = 0
    let len = this.props.fields.length
    let lis = []
    let ht
    for (; i < len; ++i) {
      ht = this.props.fields[i]
      lis.push(<ListItem
        key={i}
        rightIconButton={
          <IconButton onTouchTap={this.props.fields.remove.bind(i)}>
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
    return lis
  }

  render () {
    return (
      <div>
        <Flexbox
          flexDirection='row'
          flexWrap='wrap' alignItems='center'>
          <CardTitle subtitle='Look For Hashtags? (optional)' />
          <RaisedButton
            onTouchTap={this.addField}
            primary
            label={'#Add'}
            labelPosition={'before'}
          />
        </Flexbox>
        <div style={{overflowY: 'auto', maxHeight: 'calc(100% - 300px)'}}>
          <List style={{height: 300, maxHeight: 300}}>
            {this.makeLis()}
          </List>
        </div>
      </div>
    )
  }
}

class HashTags extends Component {
  render () {
    const {handleSubmit, pristine, reset, submitting, invalid, previousPage} = this.props
    return (
      <form onSubmit={handleSubmit} style={{width: 'inherit', height: 'inherit'}}>
        <div style={{maxHeight: 'calc(100% - 300px)'}}>
          <FieldArray name='hashtags' component={HashTags} />
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
