import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {ListItem} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Checkbox from 'material-ui/Checkbox'

export default class FriendListItem extends Component {
  static propTypes = {
    cboxKey: PropTypes.string.isRequired,
    liKey: PropTypes.string.isRequired,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
    onCheck: PropTypes.func.isRequired,
    checked: PropTypes.bool
  }

  static defaultProps = {
    cboxKey: 'AdvancedCheckBox',
    checked: false
  }

  constructor (props) {
    super(props)
    this.state = {
      checked: props.checked
    }
  }

  componentDidUpdate (prevProps, prevState, prevContext) {
    console.log('Friendlist item did update', this.props.liKey)
  }

  render () {
    return (
      <ListItem
        rightIcon={
          <Checkbox
            checked={this.state.checked}
            key={this.props.cboxKey}
            onCheck={(e, checked) => {
              this.setState({ checked }, () => {
                this.props.onCheck(checked)
              })
            }}
          />
        }
        style={{ width: '25%' }}
        key={this.props.liKey}
        primaryText={this.props.primaryText}
        secondaryText={this.props.secondaryText}
      />

    )
  }
}
