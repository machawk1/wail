import React, {Component, PropTypes} from 'react'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

export default class CollectionView extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }
  render () {
    console.log(this.props)
    let { name } = this.props
    return (
      <Card>
        <CardHeader
          title={"A collection"}
          subtitle={name}
        />
        <CardText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
          Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
          Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
        </CardText>
      </Card>
    )
  }
}