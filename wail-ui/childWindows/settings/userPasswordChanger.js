import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {ipcRenderer, remote} from 'electron'
import MenuItem from 'material-ui/MenuItem'
import autobind from 'autobind-decorator'
import {ListItem} from 'material-ui/List'
import {grey400} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

// const settings = remote.getGlobal('settings')
const { dialog } = remote

const style = {
  cursor: 'pointer'
}

export default class UserPasswordChanger extends Component {
  static propTypes = {
    usrSetting: PropTypes.string.isRequired,
    pwdSetting: PropTypes.string.isRequired,
    usrOriginal: PropTypes.string.isRequired,
    pwdOriginal: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
    channel: PropTypes.string.isRequired
  }

  constructor (props, context) {
    super(props, context)
    let usernameSetting = this.props.settings.get(props.usrSetting)
    let passwordSetting = this.props.settings.get(props.pwdSetting)
    this.state = {
      usernameSetting,
      passwordSetting,
      usrModString: usernameSetting,
      pwrdModString: passwordSetting,
      didModify: false,
      open: false,
      string: this.props.settings.get(props.whichSetting)
    }
  }

  @autobind
  handleOpen () {
    this.setState({ open: true })
  }

  @autobind
  cancelEdit () {
    this.setState({ open: false })
  }

  @autobind
  submitEdit (event) {
    let send = {
      usr: this.state.usrModString,
      pwd: this.state.pwrdModString
    }
    let ns = {
      open: false,
      usernameSetting: this.state.usrModString,
      passwordSetting: this.state.pwrdModString
    }

    dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'question',
      title: 'Are you sure?',
      message: 'You will have to restart the service in order to continue using after change',
      buttons: [ 'Im Sure', 'Cancel' ],
      cancelId: 666
    }, (r) => {
      if (r === 0) {
        ipcRenderer.send(this.props.channel, send)
        this.setState(ns)
      } else {
        this.setState({
          usrModString: this.state.usernameSetting,
          pwrdModString: this.state.passwordSetting
        })
      }
    })
  }

  @autobind
  handleInputPW (e) {
    this.setState({
      pwrdModString: e.target.value
    })
  }

  @autobind
  handleInputUN (e) {
    this.setState({
      usrModString: e.target.value
    })
  }

  @autobind
  revert (event) {
    if (this.state.passwordSetting !== this.props.pwdOriginal || this.state.usernameSetting !== this.props.usrOriginal) {
      ipcRenderer.send(this.props.channel, {
        usr: this.props.usrOriginal,
        pwrd: this.props.pwdOriginal
      })
      this.setState({
        usernameSetting: this.props.usrOriginal,
        usrModString: this.props.usrOriginal,
        passwordSetting: this.props.pwdOriginal,
        pwrdModString: this.props.pwdOriginal
      })
    }
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
          key={`UserPasswordChanger-${this.state.usernameSetting}:${this.state.passwordSetting}`}
          primaryText={`Login: ${this.state.usernameSetting}:${this.state.passwordSetting}`}
          rightIconButton={rightIconMenu}
        />
        <Dialog
          key={`UserPasswordChanger-d-${this.state.usernameSetting}:${this.state.passwordSetting}`}
          title='Change'
          actions={actions}
          modal
          open={this.state.open}
        >
          <TextField
            id={`UserPasswordChanger-tf-${this.state.usernameSetting}`}
            floatingLabelText={'Username'}
            key={`UserPasswordChanger-tf-${this.state.usernameSetting}`}
            value={this.state.usrModString}
            onChange={this.handleInputUN}
            style={{ marginRight: 5 }}
          />
          <TextField
            id={`UserPasswordChanger-tf-${this.state.passwordSetting}`}
            floatingLabelText={'Password'}
            key={`UserPasswordChanger-tf-${this.state.passwordSetting}`}
            value={this.state.pwrdModString}
            onChange={this.handleInputPW}
          />
        </Dialog>
      </div>
    )
  }
}
