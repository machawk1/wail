import React, {Component} from 'react'
import {CardActions} from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import {ipcRenderer} from 'electron'
import autobind from 'autobind-decorator'
import CrawlUrlsStore from './crawlUrlsStore'

export default class Footer extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      cancelHover: false

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
      <Toolbar className='layoutFooter'>
        <ToolbarGroup firstChild>
          <RaisedButton
            label='Cancel'
            onTouchTap={this.handleClose}
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <RaisedButton
            label='Start Crawl'
            onTouchTap={this.crawlConfigured}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
