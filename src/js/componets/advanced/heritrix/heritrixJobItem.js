import React, {Component, PropTypes} from "react"
import {ListItem} from "material-ui/List"
import {grey400} from "material-ui/styles/colors"
import IconButton from "material-ui/IconButton"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import wc from '../../../constants/wail-constants'
import EditorPopup from "../../editor/editor-popup"
import JobInfoDispatcher from '../../../dispatchers/jobInfoDispatcher'
import  {forceCrawlFinish} from '../../../actions/heritrix-actions'

const styles = {
   button: {
      margin: 12,
   },
}

export default class HeritrixJobItem extends Component {


   static propTypes = {
      jobId: PropTypes.string.isRequired,
      runs: PropTypes.array.isRequired,
      path: PropTypes.string.isRequired,
      urls: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
   }

   constructor(props, context) {
      super(props, context)

      this.state = {
         jobId: this.props.jobId,
         runs: this.props.runs,
         path: this.props.path,
         urls: this.props.urls,
         openEditor: false,
      }
      this.itemClicked = this.itemClicked.bind(this)
      this.start = this.start.bind(this)
      this.restart = this.restart.bind(this)
      this.kill = this.kill.bind(this)
      this.deleteJob = this.deleteJob.bind(this)
      this.viewConf = this.viewConf.bind(this)
      this.onOpenChange = this.onOpenChange.bind(this)
   }

   itemClicked(event) {
      console.log('clicked on jobitem')
      JobInfoDispatcher.dispatch({
         type: wc.EventTypes.VIEW_HERITRIX_JOB,
         state: this.state
      })
   }
   
   viewConf(event) {
      this.setState({openEditor: !this.state.openEditor})
   }

   start(event) {
      console.log("stat")
      
   }

   restart(event) {

   }

   kill(event) {
      forceCrawlFinish(this.state.jobId)
   }

   deleteJob(event) {

   }

   onOpenChange(event) {
      this.setState({openEditor: !this.state.openEditor})
   }


   render() {
      const iconButtonElement = (
         <IconButton
            touch={true}
            tooltip="more"
            tooltipPosition="bottom-left"
         >
            <MoreVertIcon color={grey400}/>
         </IconButton>
      )

      const rightIconMenu = (
         <IconMenu iconButtonElement={iconButtonElement}
                   anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                   targetOrigin={{horizontal: 'left', vertical: 'top'}}
         >
            <MenuItem
               primaryText="Actions"
               rightIcon={<ArrowDropRight />}
               menuItems={[
                  <MenuItem onTouchTap={this.start} primaryText="Start"/>,
                  <MenuItem onTouchTap={this.restart} primaryText="Restart"/>,
                  <MenuItem onTouchTap={this.kill} primaryText="Terminate Crawl"/>,
                  <MenuItem onTouchTap={this.deleteJob} primaryText="Delete"/>,
               ]}
            />
            <MenuItem onTouchTap={this.viewConf} primaryText="View Config"/>
         </IconMenu>
      )
      let cp = `${wc.Paths.heritrixJob}/${this.props.jobId}/crawler-beans.cxml`
      let id = this.props.jobId
      return (
         <div>
            <ListItem
               primaryText={<p>{this.state.jobId}</p>}
               onTouchTap={this.itemClicked}
               rightIconButton={rightIconMenu}
            />
            <EditorPopup
               title={`Editing Heritrix Job ${this.props.jobId} Configuration`}
               codeToLoad={{  
                  which: wc.Code.which.CRAWLBEAN,
                  jid: id,
                  codePath: cp,
                }}
               useButton={false}
               onOpenChange={this.onOpenChange}
               openFromParent={this.state.openEditor}
            />
         </div>

      )
   }
}
