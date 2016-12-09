import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import Rx from 'rxjs/Rx'
import TextField from 'material-ui/TextField'

export default class SearchInput extends Component {
  static propTypes = {
    searchSubject: PropTypes.instanceOf(Rx.BehaviorSubject).isRequired,
    inputStyle: PropTypes.object
  }
  static defaultProps = {
    inputStyle: { width: '90%', paddingLeft: '10px' }
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

    this.setState({ searchText }, () => this.props.searchSubject.next(searchText))
  }

  render () {
    return (
      <TextField
        style={this.props.inputStyle}
        id='collectionSearch'
        hintText='Search'
        value={this.state.searchText}
        onChange={::this.handleChange}
      />
    )
  }
}
