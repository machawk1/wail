import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import autobind from 'autobind-decorator'
import {shell, remote} from 'electron'

const styles = {
  button: {
    margin: 12,
  },
}

const settings = remote.getGlobal('settings')

export default class Misc extends Component {

  @autobind
  onClickViewArchiveFiles (event) {
    console.log('View Archive Files')
    shell.openItem(settings.get('warcs'))
  }

  render () {
    return (
      <div>
        <RaisedButton
          label='View Archive Files'
          labelPosition='before'
          style={styles.button}
          onMouseDown={this.onClickViewArchiveFiles}
        />
      </div>
    )
  }
}
