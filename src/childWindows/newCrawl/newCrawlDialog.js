import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {ipcRenderer, remote} from 'electron'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import {Grid, Row} from 'react-cellblock'
import CrawlUrls from './crawlUrls'
import CrawlDepth from './crawlDepth'

const style = {
  height: '500px',
  maxHeight: 'none',
  button: {
    margin: 12,
  },
}
const baseTheme = getMuiTheme(lightBaseTheme)

export default class NewCrawlDialog extends Component {

  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      urls: [],
      depth: 1,
      muiTheme: baseTheme,
    }
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  @autobind
  handleOpen () {
    this.setState({ urls: [], depth: 1 })
  }

  @autobind
  handleClose () {
    ipcRenderer.send('close-newCrawl-window')
  }

  @autobind
  crawlConfigured () {
    ipcRenderer.send('close-newCrawl-window-configured', {
      urls: this.state.urls,
      depth: this.state.depth,
    })
  }

  @autobind
  urlChanged (url) {
    let urls = this.state.urls
    console.log("crawl url added", url, urls)
    if (url.edit) {
      console.log("Edit")
      urls[ url.edit ] = url.url
    } else {
      urls.push(url)
    }
    console.log('added crawl url', urls)

    this.setState({ urls: urls })
  }

  @autobind
  depthAdded (depth) {
    console.log("crawl depth added", depth)
    this.setState({ depth: depth })
  }

  render () {
    return (
      <Grid flexible={true}>
        <CrawlUrls urlAdded={this.urlChanged}/>
        <CrawlDepth depthAdded={this.depthAdded}/>
        <Row>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton
                label="Cancel"
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
        </Row>
      </Grid>
    )
  }
}
