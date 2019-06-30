import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {ipcRenderer, remote} from 'electron'
import {ListItem} from 'material-ui/List'
import NumberPicker from './numberPicker'
import UserPasswordChanger from './userPasswordChanger'
import Avatar from 'material-ui/Avatar'

export default class HeritrixSettings extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired
  }

  render () {
    return (
      <ListItem
        leftAvatar={<Avatar size={45} backgroundColor={'transparent'} src='../../icons/heritrix.gif' />}
        primaryText='Heritrix'
        primaryTogglesNestedList
        nestedItems={
        [
          <NumberPicker key={'Numpicker'} counter={1} hint='Port' settings={this.props.settings} warnOnChange={false}
            whichSetting='heritrix.port' />,

          <UserPasswordChanger key={'H-UPC'} usrSetting='heritrix.username' pwdSetting='heritrix.password'
            usrOriginal='lorem'
            pwdOriginal='ipsum' settings={this.props.settings} channel='set-heritrix-usrpwd' />
        ]
        }
      />
    )
  }
}
