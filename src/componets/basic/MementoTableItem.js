import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import Avatar from 'material-ui/Avatar'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import Checkbox from 'material-ui/Checkbox'
import MemgatorStore from '../../stores/memgatorStore'
import MementoActionMenu from './MementoActionMenu'
import styles from '../styles/styles'

const { mementoTable } = styles.basicTab

export function getNoMementos () {
  return (
    <TableRow key="noMementosRow">
      <TableRowColumn style={mementoTable.resourceCol}>
        No url entered
      </TableRowColumn>
      <TableRowColumn style={mementoTable.copiesCol}>
        0
      </TableRowColumn>
      <TableRowColumn style={mementoTable.copiesCol}>
        Not Started
      </TableRowColumn>
      <TableRowColumn>
        No actions
      </TableRowColumn>
    </TableRow>
  )
}

export default class MementoTableItem extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    timemap: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired,
    archivalStatus: PropTypes.string,
    canFetchMemento: PropTypes.bool,
    maybeArray: PropTypes.bool.isRequired,
    jId: PropTypes.number
  }

  static defaultProps = {
    archivalStatus: 'Not Started',
    canFetchMemento: true,
    jId: -1
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      count: this.props.count,
      timemap: this.props.timemap,
      jId: this.props.jId,
      archivalStatus: this.props.archivalStatus
    }
  }

  componentWillMount () {
    MemgatorStore.on(`${this.props.url}-count-gotten`, this.updateCount)
    MemgatorStore.on(`${this.props.url}-archival-update`, this.updateArchival)
  }

  componentWillUnmount () {
    MemgatorStore.removeListener(`${this.props.url}-count-gotten`, this.updateCount)
    MemgatorStore.removeListener(`${this.props.url}-archival-update`, this.updateArchival)
  }

  @autobind
  updateArchival (update) {
    this.setState({
      archivalStatus: update
    })
  }

  @autobind
  updateCount (data) {
    console.log(`updating memento list item ${this.props.url}`, data)
    this.setState({
      count: data.count,
      timemap: data.timemap
    })
  }

  render () {
    var countOrFetching
    if (!this.props.maybeArray) {
      if (this.state.count === -1 || this.state.count === -2) {
        countOrFetching = (
          <Avatar src="icons/mLogo_animated.gif" size={30}/>
        )
      } else {
        countOrFetching = this.state.count
      }
    } else {
      countOrFetching = 'Not Available'
    }

    return (
      <TableRow>
        <TableRowColumn style={mementoTable.resourceCol}>
          {this.props.url}
        </TableRowColumn>
        <TableRowColumn style={mementoTable.copiesCol}>
          {countOrFetching}
        </TableRowColumn>
        <TableRowColumn style={mementoTable.copiesCol}>
          {this.state.archivalStatus}
        </TableRowColumn>
        <TableRowColumn>
          <MementoActionMenu url={this.props.url} archiving={false}/>
        </TableRowColumn>
      </TableRow>
    )
  }
}