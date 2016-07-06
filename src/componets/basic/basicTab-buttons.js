import React, { Component } from "react"
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar"
import RaisedButton from "material-ui/RaisedButton"
import autobind from 'autobind-decorator'
import { Row } from "react-cellblock"
import { shell } from 'electron'
import CrawlDispatcher from "../../dispatchers/crawl-dispatcher"
import GMessageDispatcher from "../../dispatchers/globalMessageDispatcher"
import UrlDispatcher from "../../dispatchers/url-dispatcher"
import wailConstants from "../../constants/wail-constants"
import styles from "../styles/styles"


const From = wailConstants.From
const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {
  constructor (props, context) {
    super(props, context)
  }

  @autobind
  onClickArchiveNow (event) {
    event.preventDefault()
    console.log('archive now')
    GMessageDispatcher.dispatch({
      type: EventTypes.QUEUE_MESSAGE,
      message: "Archiving Now!"
    })

    CrawlDispatcher.dispatch({
      type: EventTypes.BUILD_CRAWL_JOB,
      from: From.BASIC_ARCHIVE_NOW
    })
  }

  @autobind
  onClickCheckArchive (event) {
    console.log('check archive')
    UrlDispatcher.dispatch({
      type: EventTypes.CHECK_URI_IN_ARCHIVE,
    })
    GMessageDispatcher.dispatch({
      type: EventTypes.QUEUE_MESSAGE,
      message: "Checking Archive"
    })
    
  }

  @autobind
  onClickViewArchive (event) {
    console.log('view archive')
    UrlDispatcher.dispatch({
      type: EventTypes.VIEW_ARCHIVED_URI,
    })
    GMessageDispatcher.dispatch({
      type: EventTypes.QUEUE_MESSAGE,
      message: "Viewing Archive"
    })
  }

  render () {
    return (
      <Row>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <RaisedButton
              label="Archive Now!"
              labelPosition="before"
              primary={true}
              style={styles.buttonBasic}
              onMouseDown={this.onClickArchiveNow}
            />
          </ToolbarGroup>
          <ToolbarGroup >
            <RaisedButton
              label="Check Archived Status"
              labelPosition="before"
              primary={true}
              style={styles.buttonBasic}
              onMouseDown={this.onClickCheckArchive}
            />
          </ToolbarGroup>
          <ToolbarGroup >
            <RaisedButton
              label="View Archive"
              labelPosition="before"
              primary={true}
              style={styles.buttonBasic}
              onMouseDown={this.onClickViewArchive}
            />
          </ToolbarGroup>
        </Toolbar>
      </Row>
    )
  }
}
