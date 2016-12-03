import React, { PropTypes, Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {CardActions} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { List, ListItem } from 'material-ui/List'
import moment from 'moment'
import Divider from 'material-ui/Divider'
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

const levelToHuman = {
  60: 'Fatal',
  50: 'Error',
  40: 'Warning',
  30: 'Info',
  20: 'Info',
  10: 'Info'
}

export default class EventLog extends Component {
  constructor (...args) {
    super(...args)
    let events = []
    this.state = {
      events: window.eventLog.records,
      expanded: false
    }
  }

  makeEventLogHuman () {
    let elog = this.state.events.map(e => {
      return {
        lvl: levelToHuman[ e.level ],
        time: moment(e.time),
        msg: e.msg
      }
    })
    elog.sort((e1, e2) => {
      if (e1.time.isBefore(e2.time)) {
        return 1
      }

      if (e1.time.isAfter(e2.time)) {
        return -1
      }

      return 0
    })
    return elog
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  refresh () {
    if (this.state.events.length !== window.eventLog.records.length) {
      this.setState({
        events: window.eventLog.records
      })
    }
  }

  makeEventList () {
    console.log(window.eventLog.records)
    let events = this.makeEventLogHuman()
    let len = events.length
    let renderMe = []
    for (let i = 0; i < len; ++i) {
      let e = events[ i ]
      let time = e.time.format('h:mm:ss a')
      renderMe.push(<ListItem
        key={`${e.lvl}${e.msg}${time}${i}`}
        primaryText={`${e.lvl}: ${e.msg}`}
        secondaryText={time}
      />)
      if (i + 1 < len) {
        renderMe.push(<Divider key={`${e.lvl}${e.msg}${time}${i}-divider`} />)
      }
    }
    return renderMe
  }

  render () {
    return (
      <div>
        <List>
          {this.makeEventList()}
        </List>
        <CardActions>
          <FlatButton label='Refresh' onTouchTap={::this.refresh} />
        </CardActions>
      </div>

    )
  }

}
