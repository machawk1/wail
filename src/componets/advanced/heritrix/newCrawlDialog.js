import React, { Component } from "react"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import RaisedButton from "material-ui/RaisedButton"
import { Grid } from "react-cellblock"
import CrawlUrls from "./crawlUrls"
import CrawlDepth from "./crawlDepth"
import CrawlDispatcher from "../../../dispatchers/crawl-dispatcher"
import WailConstants from "../../../constants/wail-constants"

const style = {
  height: '500px',
  maxHeight: 'none',
  button: {
    margin: 12,
  },
}

const Events = WailConstants.EventTypes
const From = WailConstants.From

export default class NewCrawlDialog extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
      open: false,
      urls: [],
      depth: 1,

    }
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.crawlConfigured = this.crawlConfigured.bind(this)
    this.urlChanged = this.urlChanged.bind(this)
    this.depthAdded = this.depthAdded.bind(this)
  }

  handleOpen () {
    this.setState({ open: true, urls: [] })
  }

  handleClose () {
    this.setState({ open: false })
  }

  crawlConfigured () {
    this.setState({ open: false })
    CrawlDispatcher.dispatch({
      type: Events.BUILD_CRAWL_JOB,
      from: From.NEW_CRAWL_DIALOG,
      urls: this.state.urls,
      depth: this.state.depth,
    })
  }

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

  depthAdded (depth) {
    console.log("crawl depth added", depth)
    this.setState({ depth: depth })
  }

  render () {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Start Crawl"
        primary={true}
        onTouchTap={this.crawlConfigured}
      />,
    ]

    return (
      <div>
        <RaisedButton
          label="New Crawl"
          onTouchTap={this.handleOpen}
          labelPosition="before"
          primary={true}
          style={style.button}
        />
        <Dialog
          title="Set up new crawl"
          actions={actions}
          modal={true}
          autoDetectWindowHeight={false}
          autoScrollBodyContent={true}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <Grid>
            <CrawlUrls urlAdded={this.urlChanged}/>
            <CrawlDepth depthAdded={this.depthAdded}/>
          </Grid>
        </Dialog>
      </div>
    )
  }
}
