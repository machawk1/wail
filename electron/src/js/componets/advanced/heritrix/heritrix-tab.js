import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import HeritrixJobList from './heritrix-joblist'
import NewCrawlDialog from './newCrawlDialog'
import {Grid, Row, Column} from 'react-cellblock'
import child_process from 'child_process'
import wailConstants from '../../../constants/wail-constants'

const styles = {
   button: {
      margin: 12,
   },
}

const Heritrix = wailConstants.Heritrix

export default class HeritrixTab extends Component {
   constructor(props, context) {
      super(props, context)
      this.state = {
         crawlConfigOpen: false
      }
      this.onClickNewCrawl = this.onClickNewCrawl.bind(this)
      this.onClickLaunchWebUI = this.onClickLaunchWebUI.bind(this)

   }

   onClickNewCrawl(event) {
      console.log('New Crawl')
      this.setState({crawlConfigOpen: true})
   }

   onClickLaunchWebUI(event) {
      console.log('Edit Wayback')
      console.log(process.platform)
      switch (process.platform) {
         case 'linux':
            child_process.exec(`xdg-open ${Heritrix.web_ui}`)
            break
         case 'darwin':
            child_process.exec(`open ${Heritrix.web_ui}`)
            break
         case 'win32':
            child_process.exec(`start ${Heritrix.web_ui}`)
            break

      }


   }

   render() {
      return (
         <Paper zdepth={3}>
            <Grid flexible={true}>
               <Row>
                  <Column width="1/2">
                     <HeritrixJobList />
                  </Column>
                  <Column width="1/2">
                  </Column>
               </Row>
               <Row>
                  <Column width="1/2">
                     <NewCrawlDialog />
                  </Column>
                  <Column width="1/2">
                     <RaisedButton
                        label="Launch Web UI"
                        labelPosition="before"
                        primary={true}
                        style={styles.button}
                        onMouseDown={this.onClickLaunchWebUI}
                     />
                  </Column>
               </Row>
            </Grid>
         </Paper>
      )
   }
}
