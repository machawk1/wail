import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {ListItem} from 'material-ui/List'
import {Link, IndexLink} from 'react-router'

export default class CollectionListItem extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    clicked: PropTypes.func.isRequired
  }

  render () {
    let {name,clicked} = this.props
    return (
      <ListItem key={`col-${name}`} primaryText={name} onTouchTap={() => clicked(name)}/>
    )
  }
}