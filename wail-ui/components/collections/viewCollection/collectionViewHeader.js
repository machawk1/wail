import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Immutable from 'immutable'
import {Flex} from 'react-flex'
import {Card, CardTitle, CardText} from 'material-ui/Card'
import {Link, IndexLink} from 'react-router'

export default class CollectionViewHeader extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }
  static propTypes = {
    collection: PropTypes.instanceOf(Immutable.Map).isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    let viewingCol = this.props.collection.get('colName')
    let description = this.props.collection.get('metadata').get('description')
    let { primary1Color } = this.context.muiTheme.baseTheme.palette
    let linkStyle = { color: primary1Color, textDecoration: 'none' }
    let title = <span><IndexLink to='/' style={linkStyle}>Collections</IndexLink> > {viewingCol}</span>
    return (
      <div>
        <Flex row alignItems='baseline' justifyContent='space-between'>
          <CardTitle title={title} />
          <CardTitle subtitle={`Last Updated: ${this.props.collection.get('lastUpdated').format('MMM DD YYYY')}`} />
          <CardTitle subtitle={`Created: ${this.props.collection.get('created').format('MMM DD YYYY')}`} />
          <CardTitle subtitle={`Seeds: ${this.props.collection.get('seeds').size}`} />
          <CardTitle subtitle={`Size: ${this.props.collection.get('size')}`} />
        </Flex>
        <Card>
          <CardText>
            {description}
          </CardText>
        </Card>
      </div>
    )
  }
}

