import React, {Component, PropTypes} from 'react'
import Dimensions from 'react-dimensions'
import FlatButton from 'material-ui/FlatButton'

export default class CollectionListItem extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    clicked: PropTypes.func.isRequired
  }

  render () {
    let {
      name,
      clicked
    } = this.props
    return (
      <FlatButton label={name} onTouchTap={() => clicked(name)} />
    )
  }
}
