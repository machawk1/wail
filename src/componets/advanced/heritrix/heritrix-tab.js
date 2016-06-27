import React, {Component} from "react"
import RaisedButton from "material-ui/RaisedButton"
import {Toolbar, ToolbarGroup} from "material-ui/Toolbar"
import {Grid, Row, Column} from "react-cellblock"
import {shell} from 'electron'

import settings from '../../../settings/settings'
import wailConstants from "../../../constants/wail-constants"
import HeritrixJobList from "./heritrix-joblist"
import NewCrawlDialog from "./newCrawlDialog"


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
      console.log(process.platform)
      shell.openExternal(settings.get('heritrix.web_ui'))
   }
   
   
   render() {
      return (
         <div>
            <HeritrixJobList />
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
         </div>
      )
   }
}
