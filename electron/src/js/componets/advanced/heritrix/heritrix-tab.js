import React, {Component, PropTypes} from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import HeritrixJobList from './heritrix-joblist'
import NewCrawlDialog from './newCrawlDialog'
import {Grid, Row, Column} from 'react-cellblock'

const styles = {
   button: {
      margin: 12,
   },
}

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
                        label="Check Archived Status"
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
