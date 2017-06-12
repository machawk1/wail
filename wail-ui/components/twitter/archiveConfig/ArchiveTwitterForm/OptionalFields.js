import React, { Component } from 'react'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardMedia'
import CardExpand from 'material-ui/Card/CardExpandable'
import OptionalSearchTerms from './OptionalSearchTerms'
import MyAutoSizer from '../../../utilComponents/myAutoSizer'

export default class OptionalFields extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      expanded: false
    }
    this.onExpanding = this.onExpanding.bind(this)
  }

  onExpanding () {
    this.setState({expanded: !this.state.expanded})
  }

  makeOpts (sizeOpts) {
    return (
      <OptionalSearchTerms {...sizeOpts}/>
    )
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.expanded !== nextState.expanded
  }

  render () {
    const style = this.state.expanded ? {
      height: 300
    } : {
      display: 'none',
      visibility: 'hidden'
    }
    return (
      <div>
        <CardHeader title='Optional'/>
        <OptionalSearchTerms />
      </div>
    )
  }

}


