import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'

const styles = {
   button: {
      margin: 12,
   },
}

export default class Heritrix extends Component {
   constructor(props, context) {
      super(props, context)
      this.onClickViewArchiveFiles = this.onClickViewArchiveFiles.bind(this)
      this.onClickCheckForUpdates = this.onClickCheckForUpdates.bind(this)
   }

   onClickViewArchiveFiles(event) {
      console.log('View Archive Files')
   }

   onClickCheckForUpdates(event) {
      console.log('Check Updates')

   }

   render() {
      return (
         <Paper zdepth={3}>
               <RaisedButton
                  label="View Archive Files"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickViewArchiveFiles}
               />
               <RaisedButton
                  label="Check Updates"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickCheckForUpdates}
               />
         </Paper>
      )
   }
}

