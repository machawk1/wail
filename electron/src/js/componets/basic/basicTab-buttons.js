import React, {Component, PropTypes} from 'react'
import Snackbar from 'material-ui/Snackbar'
import RaisedButton from 'material-ui/RaisedButton'
import {Row} from 'react-cellblock'
import CrawlDispatcher from '../../dispatchers/crawl-dispatcher'
import wailConstants from '../../constants/wail-constants'

const styles = {
   button: {
      margin: 12,
   },
}

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes

export default class BasicTabButtons extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {
         autoHideDuration: 2000,
         message: 'Status Number 1',
         open: false,
      }
      this.onClickArchiveNow = this.onClickArchiveNow.bind(this)
      this.onClickCheckArchive = this.onClickCheckArchive.bind(this)
      this.onClickViewArchive = this.onClickViewArchive.bind(this)
      this.closeNotification = this.closeNotification.bind(this)
   }

   onClickArchiveNow(event) {
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

   onClickCheckArchive(event) {
      console.log('check archive')
      this.setState({
         open: !this.state.open,
         message: "Checking Archive"
      })

   }

   onClickViewArchive(event) {
      console.log('view archive')
      this.setState({
         open: !this.state.open,
         message: "Viewing Archive"
      })
   }

   closeNotification() {
      this.setState({
         open: false
      })
   }


   render() {
      return (

         <Row>
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
            <Snackbar
               open={this.state.open}
               message={this.state.message}
               autoHideDuration={this.state.autoHideDuration}
               onRequestClose={this.closeNotification}
            />
         </Row>
      )
   }
}