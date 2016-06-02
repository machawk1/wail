import React, {Component, PropTypes} from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import {Grid} from 'react-cellblock'
import CrawlUrls from './crawlUrls'
import CrawlDepth from './crawlDepth'
// import * as heritrixActions from '../../../actions/heritrix-actions'

const style = {
   height: '500px',
   maxHeight: 'none',
}


export default class NewCrawlDialog extends Component {

   constructor(props, context) {
      super(props, context)
      this.state = {
         open: false,
         urls: [],
         depth: 0,

      }
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.crawlConfigured = this.crawlConfigured.bind(this)
      this.urlChanged = this.urlChanged.bind(this)
      this.depthAdded = this.depthAdded.bind(this)
   }

   handleOpen() {
      this.setState({open: true})
   }

   handleClose() {
      this.setState({open: false})
   }

   crawlConfigured() {
      this.setState({open: false})
      // heritrixActions.makeHeritrixJobConf(this.state.urls,this.state.depth)
   }

   urlChanged(url) {
      console.log("crawl url added", url)
      let urls = this.state.urls
      urls.push(url)
      this.setState({urls: urls})
   }

   depthAdded(depth) {
      console.log("crawl depth added", depth)
      this.setState({depth: depth})
   }

   render() {
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
            <RaisedButton label="New Crawl" onTouchTap={this.handleOpen}/>
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
