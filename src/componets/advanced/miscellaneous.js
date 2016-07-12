import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'

const styles = {
  button: {
    margin: 12,
  },
}

export default class Misc extends Component {
  constructor (props, context) {
    super(props, context)
    this.onClickViewArchiveFiles = this.onClickViewArchiveFiles.bind(this)
    this.onClickCheckForUpdates = this.onClickCheckForUpdates.bind(this)
  }

  onClickViewArchiveFiles (event) {
    console.log('View Archive Files')
  }

  onClickCheckForUpdates (event) {
    console.log('Check Updates')
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
        <RaisedButton
          label='Check Updates'
          labelPosition='before'
          style={styles.button}
          onMouseDown={this.onClickCheckForUpdates}
        />
      </div>
    )
  }
}

