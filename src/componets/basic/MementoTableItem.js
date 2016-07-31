import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import Avatar from 'material-ui/Avatar'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import MemgatorStore from '../../stores/memgatorStore'
import MementoActionMenu from './MementoActionMenu'
import styles from '../styles/styles'

const {mementoTable} = styles.basicTab


export function getNoMementos () {
  return (
    <TableRow key="noMementosRow">
      <TableRowColumn style={mementoTable.resourceCol}>
        No url entered
      </TableRowColumn>
      <TableRowColumn style={mementoTable.copiesCol}>
        0
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
    ]).isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      count: this.props.count,
      timemap: this.props.timemap
    }
  }

  componentWillMount () {
    MemgatorStore.on(`${this.props.url}-updated`, this.updateCount)
  }

  componentWillUnmount () {
    MemgatorStore.removeListener(`${this.props.url}-updated`, this.updateCount)
  }

  @autobind
  updateCount () {
    let data = MemgatorStore.getDataFor(this.props.url)
    console.log(`updating memento list item ${this.props.url}`, data)
    this.setState({
      count: data.count,
      timemap: data.timemap
    })
  }

  render () {
    var countOrFetching
    if (this.state.count === -1) {
      countOrFetching = (
        <Avatar src="icons/mLogo_animated.gif" size={30}/>
      )
    } else {
      countOrFetching = this.state.count
    }
    return (
      <TableRow>
        <TableRowColumn style={mementoTable.resourceCol}>
          {this.props.url}
        </TableRowColumn>
        <TableRowColumn style={mementoTable.copiesCol}>
          {countOrFetching}
        </TableRowColumn>
        <TableRowColumn>
          <MementoActionMenu url={this.props.url} archiving={false}/>
        </TableRowColumn>
      </TableRow>
    )
  }
}