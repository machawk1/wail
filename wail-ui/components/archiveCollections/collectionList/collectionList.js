import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {List} from 'material-ui/List'
import ColListItem from './collectionListItem'

export default class CollectionList extends Component {
  static propTypes = {
    cols: PropTypes.arrayOf(PropTypes.string).isRequired,
    clicked: PropTypes.func.isRequired
  }

  render () {
    let { cols, clicked } = this.props
    return (
      <List children={cols.map(c => <ColListItem key={`colli-${c}`} name={c} clicked={clicked}/>)}/>
    )
  }
}