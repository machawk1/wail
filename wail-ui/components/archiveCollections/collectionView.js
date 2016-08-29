import React, {Component, PropTypes} from 'react'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import Title from 'react-title-component'

export default class CollectionView extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired
  }
  render () {
    let { collection } = this.props
    return (
      <div style={{marginLeft: '25px'}}>
          {JSON.stringify(collection)}
      </div>
    )
  }
}