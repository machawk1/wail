import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import { remote } from 'electron'
import RaisedButton from 'material-ui/RaisedButton'
import { TableRow, TableRowColumn } from 'material-ui/Table'
import _ from 'lodash'
import styles from '../../componets/styles/styles'

// const settings = remote.getGlobal('settings')
const { dialog } = remote

export default class FSLocationChooser extends Component {
  static propTypes = {
    whichSetting: PropTypes.string.isRequired,
    warnOnChange: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired
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
      properties: [ 'openDirectory', 'createDirectory' ]
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
    return (
      <TableRow key={this.props.whichSetting}>
        <TableRowColumn style={styles.settingsCol}>
          {`${ _.upperCase(this.props.whichSetting) } Path`}
        </TableRowColumn>
        <TableRowColumn>
          {this.state.settingValue}
        </TableRowColumn>
        <TableRowColumn style={styles.settingsActionCol}>
          <RaisedButton
            label={"Change"}
            primary={true}
            labelPosition={'before'}
            onMouseDown={this.changeLocation}
          />
          <RaisedButton
            label={"Revert"}
            style={styles.settingsButton}
            labelPosition={'before'}
            onMouseDown={this.revert}
          />
        </TableRowColumn>
      </TableRow>
    )
  }
}
