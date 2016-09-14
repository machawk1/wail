import React, { Component, PropTypes } from 'react'
import BeamMeUpScotty from 'drag-drop'
import { ipcRenderer as ipc } from 'electron'
import * as notify from '../../../actions/notification-actions'
import path from 'path'
import { joinStrings } from 'joinable'

export default class WarcToCollection extends Component {
  static propTypes = {
    colName: PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  }

  componentDidMount () {
    BeamMeUpScotty('#warcUpload', files => {
      let addMe = []
      let badFiles = new Set()

      files.forEach(f => {
        console.log(f)
        let ext = path.extname(f.path)
        if (ext === '.warc' || ext === '.arc') {
          addMe.push(f.path)
        } else {
          badFiles.add(ext)
        }
      })

      if (badFiles.size > 0) {
        notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...badFiles, { separator: ',' })}`)
      }

      if (addMe.length > 0) {
        notify.notifyInfo(`Adding ${addMe.length} ${path.extname(addMe[ 0 ])} Files`, true)
        ipc.send('add-warcs-to-col', {
          forCol: this.props.colName,
          warcs: joinStrings(...addMe, { separator: ' ' })
        })
      }
    })
  }

  render () {
    return (
      <div id='warcUpload' style={{height: '100%'}}>
        {this.props.children}
      </div>
    )
  }

}
