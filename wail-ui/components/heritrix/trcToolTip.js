import React, {Component, PropTypes} from 'react'
import Tooltip from './ToolTip'
import {TableRowColumn} from 'material-ui/Table'

const tooltips = {
  boxSizing: 'border-box'
}

export default class TRCToolTip extends Component {
  static propTypes = {
    displayMe: PropTypes.string.isRequired,
    ttkey: PropTypes.string,
    trcstyle: PropTypes.object,
    tooltipPosition: PropTypes.string,
    tooltipStyles: PropTypes.object
  }

  static defaultProps = {
    tooltipPosition: 'bottom-right',
    ttkey: 'TRCToolTip',
    trcstyle: {},
    tooltipStyles: {}
  }

  constructor (...args) {
    super(...args)
    this.state = {
      tooltipShown: false
    }
  }

  showTooltip () {
    this.setState({ tooltipShown: true })
  }

  hideTooltip () {
    this.setState({ tooltipShown: false })
  }

  handleBlur = (event) => {
    this.hideTooltip()
  }

  handleFocus = (event) => {
    this.showTooltip()
  }

  handleMouseLeave = (event) => {
    this.hideTooltip()
  }

  handleMouseOut = (event) => {
    this.hideTooltip()
  }

  handleMouseEnter = (event) => {
    this.showTooltip()
  }

  handleKeyboardFocus = (event, keyboardFocused) => {
    if (keyboardFocused) {
      this.showTooltip()
    } else {
      this.hideTooltip()
    }
  }

  render () {
    const { tooltipStyles, displayMe, ttkey, tooltipPosition, trcstyle } = this.props
    const tooltipPositions = tooltipPosition.split('-')
    const tooltipElement = <Tooltip
      touch={false}
      key={`tooltip-${ttkey}`}
      ref='tooltip'
      label={displayMe}
      show={this.state.tooltipShown}
      style={Object.assign(tooltips, trcstyle)}
      verticalPosition={tooltipPositions[ 0 ]}
      horizontalPosition={tooltipPositions[ 1 ]}
    />
    return (
      <TableRowColumn
        key={ttkey} style={trcstyle}
        onBlur={this.handleBlur} onFocus={this.handleFocus}
        onMouseLeave={this.handleMouseLeave} onMouseEnter={this.handleMouseEnter}
        onMouseOut={this.handleMouseOut}
      >
        {displayMe}
        {tooltipElement}
      </TableRowColumn>
    )
  }
}
