import React, { Component } from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import ToolTip from 'material-ui/internal/Tooltip'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import CrawlUrlsStore from './crawlUrlsStore'

export default class Footer extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      cancelHover: false,

    }
  }

  @autobind
  handleClose () {
    ipcRenderer.send('close-newCrawl-window')
  }

  @autobind
  crawlConfigured () {
    let config = CrawlUrlsStore.getCrawlConfig()
    if (config) {
      ipcRenderer.send('close-newCrawl-window-configured', config)
    }
  }

  render () {
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <RaisedButton
            label="Cancel Configure Crawl"
            onTouchTap={this.handleClose}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <RaisedButton
            label="Start Crawl"
            onTouchTap={this.crawlConfigured}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
