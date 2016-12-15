import React, { Component, PropTypes } from 'react'
import { List, ListItem } from 'material-ui/List'


export default class ErrorList extends Component {
  static propTypes = {
    done: PropTypes.bool.isRequired,
    hadErrors: PropTypes.array.isRequired
  }

  renderPossibleSeeds () {
    let len = this.props.hadErrors.length
    let lis = []
    for (let i = 0; i < len; ++i) {
      lis.push(<ListItem
        key={`${i}-${this.props.hadErrors[i].name}-li`}
        primaryText={this.props.hadErrors[i].name}
        secondaryText={this.props.hadErrors[i].error}
      />)
    }
    return lis
  }

  render () {
    let {done} = this.props
    return (
      done &&
      <List style={{marginLeft: 16, overflowY: 'auto', height: '100%', maxHeight: 'calc(100% - 200px)'}}>
        {this.props.hadErrors.length > 0 && this.renderPossibleSeeds()}
        {this.props.hadErrors.length <= 0 && <ListItem primaryText='No Errors When Determing The Seeds'/>}
      </List>
    )
  }
}

