import React, {Component, PropTypes} from 'react'
import {ipcRenderer, remote} from 'electron'
import {ListItem} from 'material-ui/List'
import FSLocationChooser from './fsLocationChooser'
import FileChooser from './fileChooser'
import SettingHardReset from './settingHardReset'
import Avatar from 'material-ui/Avatar'

export default class WailSettings extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired
  }

  render () {
    let count = 1
    let fromSettingsFile = [ 'cdx', 'warcs' ]
      .map(it => <FSLocationChooser key={count++} counter={count++} whichSetting={it} warnOnChange
        settings={this.props.settings} />)
    let otherSettings = [ { which: 'archives', alt: 'Memgator Archive List', useAlt: true } ]
      .map(it => <FileChooser key={count++} counter={count++} whichSetting={it.which} settings={this.props.settings}
        useAltName={it.useAlt} altName={it.alt} />)

    return (
      <ListItem
        leftAvatar={<Avatar className='img-circle' backgroundColor={'transparent'} src={'../../icons/whale.ico'} />}
        primaryText='WAIL'
        primaryTogglesNestedList
        nestedItems={
          fromSettingsFile.concat(otherSettings).concat(
            <SettingHardReset
              key={count++}
              counter={count++}
              channel='setting-hard-reset'
              name='Reset Settings'
            />)
        }
      />
    )
  }
}
