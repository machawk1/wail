import React, { Component, PropTypes } from 'react'
import { ipcRenderer, remote } from 'electron'
import { ListItem } from 'material-ui/List'
import NumberPicker from './numberPicker'
import Avatar from 'material-ui/Avatar'

export default class HeritrixSettings extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired
  }

  render () {
    return (
      <ListItem
        leftAvatar={<Avatar size={45} backgroundColor={'transparent'} src="../../icons/heritrix.gif"/>}
        primaryText="Heritrix"
        primaryTogglesNestedList={true}
        nestedItems={
          [
            <NumberPicker key={'Numpicker'} counter={1} hint='Port' settings={this.props.settings} warnOnChange={false}
                          whichSetting="heritrix.port"/>
          ]
        }
      />
    )
  }
}
