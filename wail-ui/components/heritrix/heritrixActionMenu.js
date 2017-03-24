import React, { Component, PropTypes } from 'react'
import { remote } from 'electron'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'

export default class HeritrixActionMenu extends Component {
  constructor (props) {
    super(props)
    this.menuRef = null
  }

  render () {
    return (
      <div></div>
    )
  }

}