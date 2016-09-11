import React, { Component, PropTypes } from 'react'
import BeamMeUpScotty from 'drag-drop'
import { Scrollbars } from 'react-custom-scrollbars'
import {ipcRenderer as ipc} from 'electron'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import * as notify from '../../../actions/notification-actions'
import path from 'path'
import { joinStrings } from 'joinable'
import { Grid, Row, Col } from 'react-flexbox-grid'

export default class WarcToCollection extends Component {
  static propTypes = {
    colName: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      renderMe: [ <p key={'WarcToCollectionDropem'}>Drop Warc Files To Add To Collection</p> ],
      addFiles: []
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log(nextProps)
    if (this.props.colName !== nextProps.colName) {
      this.setState({
        renderMe: [ <p key={'WarcToCollectionDropem'}>Drop Warc Files To Add To Collection</p>],
        addFiles: []
      })
    }
  }

  componentDidMount () {
    BeamMeUpScotty('#warcUpload', files => {
      let addMe = []
      let renderMe = []
      let badFiles = new Set()
      files.forEach((f, i) => {
        let ext = path.extname(f.path)
        if (ext === '.warc' || ext === '.arc') {
          addMe.push(f.path)
          renderMe.push(<p key={f.path}>{path.basename(f.path)}</p>)
        } else {
          badFiles.add(ext)
        }
      })
      if (badFiles.size > 0) {
        notify.notifyWarning(`Unable to add files with extensions of ${joinStrings(...[ ...badFiles ], { separator: ',' })}`)
      }

      if (addMe.length > 0) {
        this.setState({ renderMe: this.state.renderMe.concat(renderMe), addFiles: this.state.addFiles.concat(addMe) })
      }
    })
  }

  removeLastOne (event) {
    console.log('remove last one')
    if (this.state.addFiles.length > 0) {
      this.state.addFiles.pop()
      this.state.renderMe.pop()
      this.setState({addFiles: this.state.addFiles, renderMe: this.state.renderMe})
    }
  }

  addFiles () {
    console.log('Adding files ', this.state.addFiles)
    if (this.state.addFiles.length > 0) {
      notify.notifyInfo(`Adding ${this.state.addFiles.length} ${path.extname(this.state.addFiles[0])} Files`, true)
      ipc.send('add-warcs-to-col', {
        forCol: this.props.colName,
        warcs: joinStrings(...this.state.addFiles, { separator: ' ' })
      })
      this.setState({
        renderMe: [ <p key={'WarcToCollectionDropem'}>Drop Warc Files To Add To Collection</p>],
        addFiles: []
      })
    } else {
      notify.notifyWarning('No Warc/Arc Files To Add')
    }
  }

  render () {
    return (
      <div>
        <Row>
          <Col xs>
            <div id='warcUpload'
              className='warcUpload'
            >
              {this.state.renderMe}
            </div>
          </Col>
        </Row>
        <Row between='xs'>
          <Col xs>
            <RaisedButton label='Add Files' onTouchTap={::this.addFiles} />
          </Col>
          <Col xs>
            <RaisedButton label='Remove Last File' onTouchTap={::this.removeLastOne} />
          </Col>
        </Row>
      </div>

    )
  }

}
