import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import { remote } from 'electron'
import MenuItem from 'material-ui/MenuItem'
import { ListItem } from 'material-ui/List'
import _ from 'lodash'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'

// const settings = remote.getGlobal('settings')
const { dialog } = remote

const style = {
  cursor: 'pointer'
}

export default class FileChooser extends Component {
  static propTypes = {
    whichSetting: PropTypes.string.isRequired,
    warnOnChange: PropTypes.bool,
    settings: PropTypes.object.isRequired,
    useAltName: PropTypes.bool.isRequired,
    counter: PropTypes.number.isRequired,
    altName: PropTypes.string
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      settingValue: this.props.settings.get(props.whichSetting),
      originalValue: this.props.settings.get(props.whichSetting),
      didModify: false
    }
  }

  @autobind
  changeLocation (event) {
    dialog.showOpenDialog({
      title: 'Choose Location',
      defaultPath: this.state.settingValue,
      properties: [ 'openFile' ]
    }, (settingValue) => {
      if (settingValue) {
        // settings.set(this.props.whichSetting, path)
        console.log(settingValue)
        this.setState({ settingValue })
      }
    })
  }

  @autobind
  revert (event) {
    this.props.settings.set(this.props.whichSetting, this.state.originalValue)
    this.setState({ settingValue: this.state.originalValue })
  }

  render () {
    const actionIcon = (
      <IconButton
        touch
        tooltip='Modify'
        tooltipPosition='top-left'
      >
        <MoreVertIcon color={grey400} />
      </IconButton>
    )

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={actionIcon}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        targetOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem style={style} onTouchTap={this.changeLocation} primaryText='Change Location' />
        <MenuItem style={style} onTouchTap={this.revert} primaryText='Revert To Default' />
      </IconMenu>
    )
    var pt
    if (this.props.useAltName) {
      pt = this.props.altName
    } else {
      pt = `${_.upperCase(this.props.whichSetting)} Path`
    }
    return (
      <ListItem
        nestedLevel={1}
        key={`FILECHOOSER${this.props.whichSetting}`}
        primaryText={pt}
        rightIconButton={rightIconMenu}
        secondaryText={this.state.settingValue}
      />
    )
  }
}
