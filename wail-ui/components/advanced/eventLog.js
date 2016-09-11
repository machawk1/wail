import React, { PropTypes, Component } from 'react'
import Inspector from 'react-json-inspector'
import { Card, CardActions, CardHeader, CardText, CardMedia } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'

const { logger } = global

const input = React.DOM.input

class Selector extends Component {
  static defaultProps = {
    value: ''
  }

  onChange () {}

  onClick (e) {
    e.stopPropagation()
  }

  onFocus (e) {
    e.target.select()
  }

  render () {
    return (
      input({
        className: 'json-inspector__selection',
        value: this.props.value,
        size: Math.max(1, this.props.value.length),
        spellCheck: false,
        onClick: this.onClick,
        onFocus: this.onFocus,
        onChange: this.onChange
      })
    )
  }

}

export default class EventLog extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      events: {
        events: window.eventLog.records
      },
      expanded: false
    }
  }

  handleExpandChange (expanded) {
    this.setState({ expanded: expanded })
  }

  handleToggle (event, toggle) {
    this.setState({ expanded: toggle })
  }

  refresh () {
    this.setState({ events: {
      events: window.eventLog.records
    }})
  }

  render () {
    return (
      <Card expanded={this.state.expanded} onExpandChange={::this.handleExpandChange}>
        <CardHeader
          title='Event Log'
          subtitle='View Last 100 Events'
          actAsExpander
          showExpandableButton
        />
        <CardMedia expandable>
          <Inspector data={this.state.events} />
          </CardMedia>

        <CardActions>
          <FlatButton label='Refresh' onTouchTap={::this.refresh} />
        </CardActions>
      </Card>
    )
  }

}
