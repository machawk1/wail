import React, {Component, PropTypes} from 'react'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'

const makeEventList = events => {
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
      renderMe.push(<Divider key={`${e.lvl}${e.msg}${time}${i}-divider`}/>)
    }
  }
  return renderMe
}

export default class LogViewer extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired
  }

  doForceUpdate () {
    this.forceUpdate()
  }

  componentDidMount () {
    window.eventLog.onNewRecord(::this.doForceUpdate)
  }

  componentWillUnmount () {
    window.eventLog.unListenNewRecord(::this.doForceUpdate)
  }

  render () {
    const { height } = this.props
    return (
      <List
        style={{ height, maxHeight: height - 300, overflowY: 'auto' }}
      >
        {makeEventList(window.eventLog.momentizeRecords())}
      </List>
    )
  }
}

