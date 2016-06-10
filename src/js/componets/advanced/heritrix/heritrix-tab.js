import React, {Component} from "react"
import RaisedButton from "material-ui/RaisedButton"
import Paper from "material-ui/Paper"
import {Toolbar, ToolbarGroup} from "material-ui/Toolbar"
import {Grid, Row, Column} from "react-cellblock"
import child_process from "child_process"
import wailConstants from "../../../constants/wail-constants"
import HeritrixJobList from "./heritrix-joblist"
import NewCrawlDialog from "./newCrawlDialog"
import HeritrixJobInfo from "./heritrixJobInfo"

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
            <Grid flexible={true} gutterWidth={100}>
               <Row>
                  <Column width="1/2">
                     <HeritrixJobList />
                  </Column>
                  <Column width="1/2">
                     <HeritrixJobInfo/>
                  </Column>
               </Row>
            </Grid>
            <Toolbar>
               <ToolbarGroup >
                  <NewCrawlDialog />
               </ToolbarGroup>
               <ToolbarGroup>
                  <RaisedButton
                     label="Launch Web UI"
                     labelPosition="before"
                     primary={true}
                     style={styles.button}
                     onMouseDown={this.onClickLaunchWebUI}
                  />
               </ToolbarGroup>
            </Toolbar>
            
         </Paper>
      )
   }
}
