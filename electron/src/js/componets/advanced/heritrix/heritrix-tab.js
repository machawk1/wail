import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import HeritrixJobList from './heritrix-joblist'

const styles = {
   button: {
      margin: 12,
   },
}

export default class HeritrixTab extends Component {
   constructor(props, context) {
      super(props, context)
      this.onClickNewCrawl = this.onClickNewCrawl.bind(this)
      this.onClickLaunchWebUI = this.onClickLaunchWebUI.bind(this)
   }

   onClickNewCrawl(event) {
      console.log('New Crawl')
   }

   onClickLaunchWebUI(event) {
      console.log('Edit Wayback')

   }

   render() {
      return (
         <Paper zdepth={3}>
           <HeritrixJobList />
            <div>
               <RaisedButton
                  label="New Crawl!"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickNewCrawl}
               />
               <RaisedButton
                  label="Check Archived Status"
                  labelPosition="before"
                  primary={true}
                  style={styles.button}
                  onMouseDown={this.onClickLaunchWebUI}
               />
            </div>
         </Paper>
      )
   }
}
