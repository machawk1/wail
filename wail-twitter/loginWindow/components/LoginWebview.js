import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { gotContainerRef } from '../actions'

export default class LoginWebview extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.containerRef = null
    this.getContainerRef = this.getContainerRef.bind(this)
  }

  getContainerRef (containterRef) {
    this.containerRef = containterRef
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return false
  }

  componentDidMount () {
    const container = ReactDOM.findDOMNode(this.containerRef)
    this.context.store.dispatch(gotContainerRef(container))
  }

  render () {
    return (
      <div className='inheritThyWidthHeight' ref={this.getContainerRef} />
    )
  }
}
