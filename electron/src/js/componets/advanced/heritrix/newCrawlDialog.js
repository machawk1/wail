import React, {Component, PropTypes} from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import {Grid,Row,Column} from 'react-cellblock'
import CrawlUrls from './enterUrls'


export default class NewCrawlDialog extends Component {

   constructor(props, context) {
      super(props, context)
      this.state = {
         open: false,
         urls: [],
      }
      this.handleOpen = this.handleOpen.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.urlChanged = this.urlChanged.bind(this)
   }

   handleOpen () {
      this.setState({open: true})
   }

   handleClose() {
      this.setState({open: false})
   }

   urlChanged(url){
      console.log(url)
   }

   render() {
      const actions = [
         <FlatButton
            label="Cancel"
            primary={true}
            onTouchTap={this.handleClose}
         />,
         <FlatButton
            label="Ok"
            primary={true}
            onTouchTap={this.handleClose}
         />,
      ]

      return (
         <div>
            <RaisedButton label="Dialog With Date Picker" onTouchTap={this.handleOpen} />
            <Dialog
               title="Dialog With Date Picker"
               actions={actions}
               modal={false}
               open={this.state.open}
               onRequestClose={this.handleClose}
            >
              <CrawlUrls urlAdded={this.urlChanged}/>
            </Dialog>
         </div>
      )
   }
}
