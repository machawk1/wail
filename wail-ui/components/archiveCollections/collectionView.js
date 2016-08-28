import React, {Component, PropTypes} from 'react'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'

export default class CollectionView extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired
  }
  render () {
    let { name, descripton } = this.props
    return (
      <Card>
        <CardHeader
          title={name}
        />
        <CardText>
          {descripton}
        </CardText>
      </Card>
    )
  }
}