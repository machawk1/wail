import PropTypes from 'prop-types'
import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn'
import SortIndicator from './sortIndicator'
import SortDirection from './sortDirection'

export default class SortHeader extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
    onTouchTap: PropTypes.func.isRequired,
    extraElem: PropTypes.element
  }

  static defaultProps = {
    extraElem: null
  }

  constructor (...args) {
    super(...args)
    this.state = {
      headerClicked: false
    }
  }

  render () {
    const newSortDirection = this.props.sortDirection === SortDirection.DESC
      ? SortDirection.ASC
      : SortDirection.DESC
    const onTouchTap = () => {
      if (!this.state.headerClicked) {
        this.setState({ headerClicked: true },
          this.props.onTouchTap(this.props.key, newSortDirection)
        )
      } else {
        this.props.onTouchTap(this.props.key, newSortDirection)
      }
    }
    return (
      <TableHeaderColumn
        style={{
          cursor: 'pointer'
        }}
        onTouchTap={onTouchTap}
      >
        {this.props.extraElem !== null && this.props.extraElem}
        {this.props.text}
        {this.state.headerClicked && <SortIndicator key='SortIndicator' sortDirection={this.props.sortDirection} />}
      </TableHeaderColumn>
    )
  }
}
