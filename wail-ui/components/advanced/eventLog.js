import React, {PropTypes, Component} from 'react'
import {Card, CardActions, CardHeader, CardMedia} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {List, ListItem} from 'material-ui/List'
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
    console.log( window.eventLog.records)
    this.state = {
      events: window.eventLog.records,
      expanded: false
    }
  }

  makeEventLogHuman() {
    let elog = this.state.events.map(e => {
      return {
        lvl: levelToHuman[e.level],
        time: moment(e.time),
        msg: e.msg
      }
    })
    elog.sort((e1,e2) => {
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

  handleExpandChange (expanded) {
    this.setState({ expanded: expanded })
  }

  handleToggle (event, toggle) {
    this.setState({ expanded: toggle })
  }

  refresh () {
    if (this.state.events.length !== window.eventLog.records.length) {
      this.setState({
        events: window.eventLog.records
      })
    }
  }

  makeEventList() {
    console.log( window.eventLog.records)
    let events = this.makeEventLogHuman()
    let len = events.length
    let renderMe = []
    for(let i =0; i < len; ++i) {
      let e = events[i]
      let time = e.time.format('h:mm:ss a')
      renderMe.push(<ListItem
        key={`${e.lvl}${e.msg}${time}`}
        primaryText={`${e.lvl}: ${e.msg}`}
        secondaryText={time}
      />)
      if (i+1 < len) {
        renderMe.push(<Divider key={`${i}${time}`}/>)
      }
    }
    return renderMe
  }

  render () {
    return (
      <div style={{width: '100%'}}>
        <Card
        >
          <CardHeader
            title='Event Log'
            subtitle='View Last 100 Events'
          />
          <CardMedia>
           <List
             style={{
               minHeight: '250px',
               maxHeight: '250px',
               overflowY: 'scroll',
               overflowX: 'hidden'
             }}
           >
             {this.makeEventList()}
           </List>
          </CardMedia>
          <CardActions>
            <FlatButton label='Refresh' onTouchTap={::this.refresh}/>
          </CardActions>
        </Card>
      </div>
    )
  }

}
