import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Field } from 'redux-form/immutable'
import { Flex } from 'react-flex'
import pure from 'recompose/pure'
import RadioButtonSelector from './radioButtonSelector'

class ForColAndLength extends Component {
  static propTypes = {
    forColStyle: PropTypes.object,
    lenStyle: PropTypes.object,
    flexOpts: PropTypes.object,
    cols: PropTypes.array.isRequired,
    times: PropTypes.array.isRequired
  }

  static defaultProps = {
    forColStyle: {
      height: 200,
      overflowY: 'auto'
    },
    lenStyle: {
      height: 200,
      overflowY: 'auto'
    },
    flexOpts: {
      row: true,
      justifyContent: 'space-around'
    }
  }

  render () {
    let {forColStyle, lenStyle, cols, times, flexOpts} = this.props
    return (
      <Flex {...flexOpts}>
        <Field
          style={forColStyle}
          name='forCol'
          title='For Collection'
          component={RadioButtonSelector}
        >
          {cols}
        </Field>
        <Field
          style={lenStyle}
          name='length'
          title='How Long To Monitor'
          component={RadioButtonSelector}
        >
          {times}
        </Field>
      </Flex>
    )
  }
}

export default pure(ForColAndLength)
