import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {connect} from 'react-redux'
import {List, ListItem} from 'material-ui/List'
import MyAutoSizer from '../../utilComponents/myAutoSizer'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-new'
import IconButton from 'material-ui/IconButton'
import {openUrlInBrowser} from '../../../actions/util-actions'
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
      return <p style={pStyle} dangerouslySetInnerHTML={{ __html: result.m }} />
    }
    let render = [ 'HTTP 200 OK', '<br />' ]
    _.toPairs(result.stats).forEach(([k, v]) => {
      if (v !== 0) {
        render.push(`${k}: ${v}`)
        render.push('<br/>')
      }
    })
    return <p style={pStyle} dangerouslySetInnerHTML={{ __html: render.join('') }} />
  }

  render () {
    console.log('CheckResults', this.props)
    return (
      <div style={{ height: '100%' }}>
        {!this.props.check.get('checkingDone') && this.renderMessage()}
        {this.props.check.get('checkingDone') && this.renderResult()}
      </div>
    )
  }

}

export default connect(state => ({ check: state.get('checkUrl') }))(CheckResults)
