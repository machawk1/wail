import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {ListItem} from 'material-ui/List'
import {Link, IndexLink} from 'react-router'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'

export default class CollectionListItem extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    clicked: PropTypes.func.isRequired
  }

  render () {
    let {
      name,
      clicked,
      description
    } = this.props
    // <ListItem key={`col-${name}`} primaryText={name} onTouchTap={() => clicked(name)}/>
    return (
      <Card>
        <CardHeader
          title={name}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText  expandable={true}>
          {description}
        </CardText>
        <CardActions>
          <FlatButton label="View" onTouchTap={() => clicked(name)}/>
        </CardActions>
      </Card>
    )
  }
}