import React, { Component } from 'react'
import { Field } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import ListItem from 'material-ui/List/ListItem'
import IconButton from 'material-ui/IconButton'
import Remove from 'material-ui/svg-icons/content/remove-circle'

export default class ASearchTerm extends Component {
  constructor (...args) {
    super(...args)
    this.removeMe = this.removeMe.bind(this)
  }

  removeMe () {
    this.props.removeMe(this.props.i)
  }

  render () {
    return (
      <ListItem
        key={`sterm-li-${this.props.i}`}
        rightIconButton={
          <IconButton
            onTouchTap={this.removeMe}
            key={`sterm-li-ib-${this.props.i}`}
          >
            <Remove
              key={`sterm-li-ib-i-${this.props.i}`}
            />
          </IconButton>
        }
        primaryText={
          <Field
            key={this.props.i}
            hintText='web archiving'
            name={`${this.props.ht}`}
            component={TextField}
          />
        }
      />
    )
  }
}
