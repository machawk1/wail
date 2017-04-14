import PropTypes from 'prop-types'
import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import Rx from 'rxjs/Rx'
import TextField from 'material-ui/TextField'
import Search from 'material-ui/svg-icons/action/search'
import {Card, CardText} from 'material-ui/Card'

export default class FilterCollection extends Component {
  static propTypes = {
    filterText: PropTypes.instanceOf(Rx.BehaviorSubject).isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: ''
    }
  }

  handleChange (event) {
    const searchText = event.target.value
    if (searchText === this.state.searchText) {
      return
    }

    this.setState({ searchText: searchText }, () => this.props.filterText.next(searchText))
  }

  render () {
    return (
      <Card>
        <CardText
          style={{ padding: 0, paddingLeft: 64 }}>
          <span>
            <TextField
              style={{ width: '90%', paddingLeft: '10px' }}
              id='collectionSearch'
              hintText='Search'
              value={this.state.searchText}
              onChange={::this.handleChange}
              />
          </span>
          <span>
            <Search />
          </span>
        </CardText>
      </Card>
    )
  }
}
