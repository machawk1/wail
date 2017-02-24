import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import { Flex } from 'react-flex'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Link, IndexLink } from 'react-router'

class Location extends Component {
  render () {
    console.log(this.props.params)
    return (
      <span>{this.props.headLock}</span>
    )
  }

}

export default Location
