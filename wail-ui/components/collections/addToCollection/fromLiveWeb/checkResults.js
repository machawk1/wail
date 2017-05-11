import PropTypes from 'prop-types'
import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import _ from 'lodash'

const pStyle = {
  fontStyle: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit'
}


class CheckResults extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderMessage () {
    return <p style={pStyle}>{this.props.check.get('message')}</p>
  }

  renderResult () {
    let result = this.props.check.get('result')
    if (result.wasError) {
      return <p id='checkSeedResults' style={pStyle} dangerouslySetInnerHTML={{__html: result.m}} />
    }
    let render = ['HTTP 200 OK', '<br />']
    let pairs = _.toPairs(result.stats)
    let len = pairs.length
    let i = 0
    for(; i < len; ++i) {
      let [k,v] = pairs[i]
      if (v !== 0) {
        render.push(`${k}: ${v}`)
        render.push('<br/>')
      }
    }
    return <p id='checkSeedResults' style={pStyle} dangerouslySetInnerHTML={{__html: render.join('')}} />
  }

  render () {
    return (
      <div style={{height: '100%'}}>
        {!this.props.check.get('checkingDone') && this.renderMessage()}
        {this.props.check.get('checkingDone') && this.renderResult()}
      </div>
    )
  }
}

export default connect(state => ({check: state.get('checkUrl')}))(CheckResults)
