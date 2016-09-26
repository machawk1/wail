import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import CollectionList from '../collectionList'
import autobind from 'autobind-decorator'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'


export default class CollectionCard extends Component {
  static propTypes = {
    viewingCol: PropTypes.string.isRequired,
    children:  PropTypes.node.isRequired
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (...args) {
    super(...args)
    let { muiTheme } = this.context
    this.styles = {
      'notExpanded': {
        headerStyle: {
          borderBottom: `1px solid ${muiTheme.palette.accent3Color}`
        },
        expanderStyle: {}
      },
      'expanded': {
        headerStyle: {},
        expanderStyle: {
          borderBottom: `1px solid ${muiTheme.palette.accent3Color}`
        }
      }
    }
    this.state = {
      expanded: false,
      headerStyle: this.styles.notExpanded.headerStyle,
      expanderStyle: this.styles.notExpanded.expanderStyle
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    let shouldUpdate = shallowCompare(this,nextProps,nextState)
    console.log(this.props, nextProps,shouldUpdate)
    return shouldUpdate
  }

  @autobind
  handleExpandChange (expanded) {
    let newStyle = expanded ? this.styles.expanded : this.styles.notExpanded
    this.setState({ expanded, ...newStyle })
  }

  render () {
    console.log(this.props.children)
    return (
      <Card
        style={{ height: '100%' }}
        expanded={this.state.expanded} onExpandChange={this.handleExpandChange}
      >
        <CardHeader
          style={this.state.headerStyle}
          title='Collections'
          subtitle={`Viewing ${this.props.viewingCol}`}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText expandable style={this.state.expanderStyle}>
          <CollectionList currCollection={this.props.viewingCol}/>
        </CardText>
        {this.props.children}
      </Card>
    )
  }
}
