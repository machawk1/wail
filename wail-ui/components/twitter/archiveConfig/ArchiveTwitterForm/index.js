import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Form, FieldArray, reduxForm } from 'redux-form/immutable'
import CardHeader from 'material-ui/Card/CardHeader'
import validate from './validate'
import SelectForCol from './SelectForCol'
import InputName from './InputName'
import { Flex, Item } from 'react-flex'
import OptionalFields from './OptionalFields'
import RequiredFields from './RequiredFields'
import MonitorTime from './MonitorTime'

const formConfig = {
  form: 'archiveTwitter',  // a unique identifier for this form,
  destroyOnUnmount: false,
  immutableProps: ['cols'],
  validate
}

class ArchiveTwitterForm2 extends Component {
  static propTypes = {
    cols: PropTypes.object.isRequired,
    times: PropTypes.array.isRequired,
    submit: PropTypes.func.isRequired
  }
  constructor (...args) {
    super(...args)
    this.state = { page: 1 }
    this.nextPage = this.nextPage.bind(this)
    this.previousPage = this.previousPage.bind(this)
    this.returnSubmit = this.returnSubmit.bind(this)
  }

  nextPage () {
    this.setState({page: this.state.page + 1})
  }

  previousPage () {
    this.setState({page: this.state.page - 1})
  }

  returnSubmit (values) {
    this.props.submit(values)
    this.previousPage()
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.page !== nextState.page
  }

  render () {
    return this.state.page === 1 ? (
      <RequiredFields cols={this.props.cols} times={this.props.times} onSubmit={this.nextPage} />
    ) : (
      <OptionalFields previousPage={this.previousPage} onSubmit={this.returnSubmit} />
    )
  }
}

function ArchiveTwitterForm ({handleSubmit, pristine, reset, submitting, invalid, cols, times}) {
  return (
    <Form onSubmit={handleSubmit} style={{width: '100%', height: '100%'}}>
      <CardHeader title='Required' style={{paddingBottom: 0}} />
      <Flex row justifyContent='space-around'>
        <InputName />
        <SelectForCol cols={cols} />
        <MonitorTime times={times} />
      </Flex>
      <CardActions>
        <FlatButton label='Start' type='submit' disabled={invalid || pristine || submitting} primary />
        <FlatButton label='Clear' onTouchTap={reset} />
      </CardActions>
    </Form>
  )
}

export default reduxForm(formConfig)(ArchiveTwitterForm2)
