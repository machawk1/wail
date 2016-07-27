import React, { Component, PropTypes } from 'react'
import AppBar from 'material-ui/AppBar'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import { Grid, Row } from 'react-cellblock'
import EnterCrawlUrls from './enterCrawlUrls'
import CrawlDepth from './crawlDepth'
import CrawlUrlList from './crawlUrlList'
import CrawlUrlStore from './crawlUrlsStore'
import styles from '../../componets/styles/styles'

const baseTheme = getMuiTheme(lightBaseTheme)

export default class NewCrawlDialog extends Component {

  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      muiTheme: baseTheme,
    }
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  @autobind
  handleClose () {
    ipcRenderer.send('close-newCrawl-window')
  }

  @autobind
  crawlConfigured () {
    ipcRenderer.send('close-newCrawl-window-configured', CrawlUrlStore.getCrawlConfig())
  }

  render () {
    return (
      <div>
        <AppBar
          title="New Crawl Configuration"
          showMenuIconButton={false}
          zDepth={0}
          style={styles.appBar}
        />
        <div style={styles.root}>
          <Grid flexible={true}>
            <Row>
              <CrawlUrlList />
            </Row>
            <EnterCrawlUrls />
            <CrawlDepth />
          </Grid>
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
        </div>
      </div>

    )
  }
}
