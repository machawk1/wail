import React, {Component, PropTypes} from "react"
import {shell} from 'electron'
import {ListItem} from "material-ui/List"
import {grey400} from "material-ui/styles/colors"
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import Divider from 'material-ui/Divider'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import {Grid, Row, Column} from "react-cellblock"
import del from 'del'
import path from 'path'
import autobind from 'autobind-decorator'

import settings from '../../../settings/settings'
import wc from '../../../constants/wail-constants'
import CrawlDispatcher from "../../../dispatchers/crawl-dispatcher"
import  {forceCrawlFinish, deleteHeritrixJob, restartJob} from '../../../actions/heritrix-actions'
import HeritrixJobInfo from "./heritrixJobInfo"

//hehe i love this syntax
const genDeleteJobFun = (jid) => {
  return () =>
    del([ `${settings.get('heritrixJob')}${path.sep}${jid}` ], { force: true })
      .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))
}

export default class HeritrixJobItem extends Component {

  static propTypes = {
    jobId: PropTypes.string.isRequired,
    runs: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    urls: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]).isRequired,
  }

  constructor (props, context) {
    super(props, context)
  }

  @autobind
  viewConf (event) {
    shell.openItem(`${settings.get('heritrixJob')}/${this.props.jobId}/crawler-beans.cxml`)
  }

  @autobind
  start (event) {
    console.log("stat")
    let runs = this.props.runs
    if (runs.length > 0) {
      if (runs[ 0 ].ended) {
        restartJob(this.props.jobId)
      }
    } else {
      restartJob(this.props.jobId)
    }

  }

  @autobind
  restart (event) {
    let runs = this.props.runs
    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        forceCrawlFinish(this.props.jobId, () => restartJob(this.props.jobId))
      } else {
        restartJob(this.props.jobId)
      }
    } else {
      restartJob(this.props.jobId)
    }

  }

  @autobind
  kill (event, cb) {
    forceCrawlFinish(this.props.jobId, cb)
  }


  @autobind
  deleteJob (event) {
    let runs = this.props.runs
    let cb = genDeleteJobFun(this.props.jobId)

    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        console.log("We have runs and the running one has not ended")
        deleteHeritrixJob(this.props.jobId, cb)
      } else {
        console.log("We have runs and the run has ended")
      }
    } else {
      console.log("We have no runs delete ok")
      deleteHeritrixJob(this.props.jobId, cb)
    }

    CrawlDispatcher.dispatch({
      type: wc.EventTypes.CRAWL_JOB_DELETED,
      jobId: this.props.jobId
    })
  }

  render () {
    const actionIcon = (
      <IconButton
        touch={true}
        tooltip="Actions"
        tooltipPosition="bottom-left"
      >
        <MoreVertIcon color={grey400}/>
      </IconButton>
    )

    const rightIconMenu = (
      <IconMenu iconButtonElement={actionIcon}
                anchorOrigin={{ vertical: 'top', horizontal: 'left',}}
                targetOrigin={{ vertical: 'top', horizontal: 'left',}}
      >
        <MenuItem onTouchTap={this.viewConf} primaryText="View Config"/>
        <Divider />
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
      </IconMenu>
    )

    return (
      <ListItem
        key={`hjiLI-${this.props.jobId}`}
        disabled={true}
        primaryText={<HeritrixJobInfo jobId={this.props.jobId} runs={this.props.runs}/>}
        rightIconButton={rightIconMenu}
      />
    )
  }
}
