import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  Divider,
  Menu,
  MenuItem,
  Popover
} from 'material-ui'

export default class ContextMenu extends Component {
  static propTypes = {
    menuList: PropTypes.array,
    openEvent: PropTypes.any,
    onClose: PropTypes.any
  }

  static defaultProps = {
    menuList: [],
    openEvent: null,
    onClose: null
  }

  state = {
    open: !!this.props.openEvent,
    openEvent: this.props.openEvent,
    menuList: this.props.menuList
  }

  componentWillReceiveProps (nextProps) {
    let nextState = {}
    if (nextProps.openEvent) {
      nextState.openEvent = {
        absX: nextProps.openEvent.absX,
        absY: nextProps.openEvent.absY
      }
    }
    if (nextProps.menuList) {
      nextState.menuList = nextProps.menuList
    }
    this.setState(nextState, () => {
      if (nextState.openEvent && !this.state.open) {
        this.setState({open: true})
      }
      if (!nextState.openEvent && this.state.open) {
        this.setState({open: false})
      }
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  get mockAnchorEl () {
    let openEvent = this.state.openEvent || this.lastOpenEvent || {relX: 0, relY: 0}
    this.lastOpenEvent = openEvent
    let height = 8
    this.state.menuList.forEach(menuItem => {
      if (menuItem === 'divider') {
        height += 16
      } else {
        height += 48 + 8
      }
    })
    return {
      getBoundingClientRect: () => ({
        // bottom: 0,
        left: openEvent.absX,
        // right: 0,
        top: openEvent.absY
      }),
      offsetWidth: 336,
      offsetHeight: height
    }
  }

  render () {
    let mockAnchorEl = this.mockAnchorEl

    let menu = (
      <Menu style={{width: mockAnchorEl.offsetWidth}}>
        {this.state.menuList.map((menuItem, i) => {
          if (menuItem === 'divider') { return <Divider key={i} /> }
          return <MenuItem key={i} index={i} {...menuItem} />
        })}
      </Menu>
    )

    return (
      <Popover
        style={{
          width: mockAnchorEl.offsetWidth + 2,
          height: mockAnchorEl.offsetHeight + 2,
          border: '1px solid white'
        }}
        open={this.state.open}
        anchorEl={mockAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={this.closePopover.bind(this)}
        useLayerForClickAway={false}>
        {menu}
      </Popover>
    )
  }

  closePopover () {
    this.setState({open: false}, () => {
      this.setState({openEvent: null}, this.props.onClose)
    })
  }
}
