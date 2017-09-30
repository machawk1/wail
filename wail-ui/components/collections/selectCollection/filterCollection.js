import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { BehaviorSubject } from 'rxjs'
import TextField from 'material-ui/TextField'
import Search from 'material-ui/svg-icons/action/search'
import { Card, CardText } from 'material-ui/Card'
import {selectCollection} from '../../../constants/uiStrings'

export default class FilterCollection extends Component {
  static propTypes = {
    filterText: PropTypes.instanceOf(BehaviorSubject).isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      searchText: ''
    }
    this._setStateCB = this._setStateCB.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  _setStateCB () {
    this.props.filterText.next(this.state.searchText)
  }

  handleChange (event) {
    const searchText = event.target.value
    if (searchText === this.state.searchText) {
      return
    }
    this.setState({searchText: searchText}, this._setStateCB)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.searchText !== nextState.searchText
  }

  render () {
    return (
      <Card>
        <CardText
          style={{padding: 0, paddingLeft: 64}}>
          <span>
            <TextField
              style={{width: '90%', paddingLeft: '10px'}}
              id='collectionSearch'
              hintText={selectCollection.filterColTFHint}
              value={this.state.searchText}
              onChange={this.handleChange}
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
