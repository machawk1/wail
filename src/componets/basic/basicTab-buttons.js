import React, {Component} from "react"
import {shell} from 'electron'
import Snackbar from "material-ui/Snackbar"
import RaisedButton from "material-ui/RaisedButton"
import autobind from 'autobind-decorator'
import CrawlDispatcher from "../../dispatchers/crawl-dispatcher"
import UrlDispatcher from "../../dispatchers/url-dispatcher"
import wailConstants from "../../constants/wail-constants"
import {Toolbar, ToolbarGroup} from "material-ui/Toolbar"

const styles = {
  button: {
    margin: 12,
  },
}

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      autoHideDuration: 2000,
      message: 'Status Number 1',
      open: false,
    }
  }

  @autobind
  onClickArchiveNow (event) {
    event.preventDefault()
    console.log('archive now')
    this.setState({
      open: !this.state.open,
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
    this.setState({
      open: !this.state.open,
      message: "Checking Archive"
    })

  }

  @autobind
  onClickViewArchive (event) {
    console.log('view archive')
    UrlDispatcher.dispatch({
      type: EventTypes.VIEW_ARCHIVED_URI,
    })
    this.setState({
      open: !this.state.open,
      message: "Viewing Archive"
    })
  }

  @autobind
  closeNotification () {
    this.setState({
      open: false
    })
  }

  render () {
    return (
      <div>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <RaisedButton
              label="Archive Now!"
              labelPosition="before"
              primary={true}
              style={styles.button}
              onMouseDown={this.onClickArchiveNow}
            />
            <RaisedButton
              label="Check Archived Status"
              labelPosition="before"
              primary={true}
              style={styles.button}
              onMouseDown={this.onClickCheckArchive}
            />
            <RaisedButton
              label="View Archive"
              labelPosition="before"
              primary={true}
              style={styles.button}
              onMouseDown={this.onClickViewArchive}
            />
          </ToolbarGroup>
        </Toolbar>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.closeNotification}
        />
      </div>
    )
  }
}
