import React, { Component, PropTypes } from 'react'
import { ipcRenderer, remote } from 'electron'
import MenuItem from 'material-ui/MenuItem'
import { ListItem } from 'material-ui/List'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import isInt from 'validator/lib/isInt'

// const settings = remote.getGlobal('settings')
const { dialog } = remote

const style = {
  cursor: 'pointer'
}

export default class NumberPicker extends Component {
  static propTypes = {
    whichSetting: PropTypes.string.isRequired,
    hint: PropTypes.string.isRequired,
    warnOnChange: PropTypes.bool.isRequired,
    counter: PropTypes.number.isRequired,
    settings: PropTypes.object.isRequired,
    notifyMain: PropTypes.bool,
    channel: PropTypes.string
  }

  static defaultProps = {
    notifyMain: false
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      settingValue: this.props.settings.get(props.whichSetting),
      originalValue: this.props.settings.get(props.whichSetting),
      didModify: false,
      open: false,
      number: this.props.settings.get(props.whichSetting)
    }
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  cancelEdit = () => {
    this.setState({ open: false })
  }

  submitEdit = () => {
    let ns = {
      open: false,
      settingValue: this.state.settingValue
    }

    if (isInt(this.state.number)) {
      dialog.showMessageBox(remote.getCurrentWindow(), {
        type: 'question',
        title: 'Are you sure?',
        message: 'You will have to restart the service in order to continue using after change',
        buttons: [ 'Im Sure', 'Cancel' ],
        cancelId: 666
      }, (r) => {
        if (r === 0) {
          this.props.settings.set(this.props.whichSetting, this.state.number)
          ns.settingValue = this.state.number
          if (this.props.notifyMain) {
            ipcRenderer.send(this.props.channel)
          }
          this.setState(ns)
        }
      })
    } else {
      this.setState(ns)
    }
  }

  handleInput = (e) => {
    this.setState({
      number: e.target.value
    })
  }

  revert = (event) => {
    this.props.settings.set(this.props.whichSetting, this.state.originalValue)
    if (this.props.notifyMain) {
      ipcRenderer.send(this.props.channel)
    }
    this.setState({ settingValue: this.state.originalValue, number: this.state.originalValue })
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
        <MenuItem style={style} onTouchTap={this.handleOpen} primaryText='Change' />
        <MenuItem style={style} onTouchTap={this.revert} primaryText='Revert To Default' />
      </IconMenu>
    )
    const actions = [
      <FlatButton
        label='Cancel'
        onTouchTap={this.cancelEdit}
      />,
      <FlatButton
        label='Submit'
        primary
        onTouchTap={this.submitEdit}
      />
    ]
    return (
      <div>
        <ListItem
          nestedLevel={3.5}
          key={`NumberPicks${this.props.whichSetting}`}
          primaryText={`${this.props.hint}: ${this.state.settingValue}`}
          rightIconButton={rightIconMenu}
        />
        <Dialog
          key={`np-d-${this.props.whichSetting}`}
          title='Change'
          actions={actions}
          modal
          open={this.state.open}
        >
          <TextField
            key={`np-tf-${this.props.whichSetting}`}
            hintText={this.props.hint}
            value={this.state.number}
            onChange={this.handleInput}
          />
        </Dialog>
      </div>
    )
  }
}
