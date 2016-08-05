import React, { Component } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'
import autobind from 'autobind-decorator'
import { Row } from 'react-cellblock'
import ViewArchiveIcon from 'material-ui/svg-icons/image/remove-red-eye'
import CheckArchiveStatIcon from 'material-ui/svg-icons/action/schedule'
import UrlDispatcher from '../../dispatchers/url-dispatcher'
import wailConstants from '../../constants/wail-constants'
import styles from '../styles/styles'

const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {

  @autobind
  onClickCheckArchive (event) {
    // console.log('check archive')
    UrlDispatcher.dispatch({
      type: EventTypes.CHECK_URI_IN_ARCHIVE
    })
  }

  @autobind
  onClickViewArchive (event) {
    // console.log('view archive')
    UrlDispatcher.dispatch({
      type: EventTypes.VIEW_ARCHIVED_URI
    })
  }

  render () {
    return (
      <>
      <ToolbarGroup firstChild={true}>
        <RaisedButton
          icon={<CheckArchiveStatIcon />}
          onMouseDown={this.onClickCheckArchive}
        />
      </ToolbarGroup>
      <ToolbarGroup lastChild={true}>
        <RaisedButton
          icon={<ViewArchiveIcon />}
          onMouseDown={this.onClickViewArchive}
        />
      </ToolbarGroup>
      </>
    )
  }
}
