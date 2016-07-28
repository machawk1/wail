import React, { Component, PropTypes } from 'react'
import { shell, remote } from 'electron'
import { ListItem } from 'material-ui/List'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import fs from 'fs-extra'
import cp from 'child_process'
import path from 'path'
import autobind from 'autobind-decorator'
import wc from '../../../constants/wail-constants'
import CrawlStore from '../../../stores/crawlStore'
import CrawlDispatcher from '../../../dispatchers/crawl-dispatcher'
import {
  forceCrawlFinish,
  deleteHeritrixJob,
  restartJob,
  rescanJobDir
} from '../../../actions/heritrix-actions'
import HeritrixJobInfo from './heritrixJobInfo'

const style = {
  cursor: 'pointer'
}
const settings = remote.getGlobal('settings')

export default class HeritrixJobItem extends Component {

  static propTypes = {
    jobId: PropTypes.string.isRequired,
    runs: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    urls: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]).isRequired,
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      runs: props.runs
    }
  }

  componentWillMount () {
    CrawlStore.on(`${this.props.jobId}-updated`, this.updateRuns)
  }

  componentWillUnmount () {
    CrawlStore.removeListener(`${this.props.jobId}-updated`, this.updateRuns)
  }

  @autobind
  updateRuns () {
    this.setState({ runs: CrawlStore.getRuns(this.props.jobId) })
  }

  @autobind
  viewConf (event) {
    shell.openItem(`${settings.get('heritrixJob')}/${this.props.jobId}/crawler-beans.cxml`)
  }

  @autobind
  start (event) {
    // console.log('stat')
    let runs = this.state.runs
    if (runs.length > 0) {
      if (runs[ 0 ].ended) {
        restartJob(this.props.jobId)
      } else {
        forceCrawlFinish(this.props.jobId, () => restartJob(this.props.jobId))
      }
    } else {
      restartJob(this.props.jobId)
    }
  }

  @autobind
  restart (event) {
    let runs = this.state.runs
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
  kill (event) {
    forceCrawlFinish(this.props.jobId)
  }

  @autobind
  deleteJob (event) {
    // console.log('Deleting Job')
    let runs = this.state.runs
    let jPath = `${settings.get('heritrixJob')}${path.sep}${this.props.jobId}`
    let cb = () => {
      if (process.platform === 'win32') {
        cp.execFile(settings.get('winDeleteJob'), [ `${jPath}` ], (error, stdout, stderr) => {
          if (error) {
            // console.log(stderr)
            // console.log(error)
          } else {
            rescanJobDir()
          }
        })
      } else {
        fs.remove(jPath, error => {
          if (error) return // console.error(error)
          rescanJobDir()
        })
      }
    }
    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        // console.log('We have runs and the running one has not ended')
        forceCrawlFinish(this.props.jobId, () => {
          deleteHeritrixJob(this.props.jobId, cb)
        })
      } else {
        // console.log('We have runs and the run has ended')
        deleteHeritrixJob(this.props.jobId, cb)
      }
    } else {
      // console.log('We have no runs delete ok')
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
        tooltip='Actions'
        tooltipPosition="bottom-left"
      >
        <MoreVertIcon color={grey400}/>
      </IconButton>
    )

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={actionIcon}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        targetOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem style={style} onTouchTap={this.viewConf} primaryText='View Config'/>
        <Divider  />
        <MenuItem
          style={style}
          primaryText='Actions'
          rightIcon={<ArrowDropRight  />}
          menuItems={[
            <MenuItem style={style} onTouchTap={this.start} primaryText='Start'/>,
            <MenuItem style={style} onTouchTap={this.restart} primaryText='Restart'/>,
            <MenuItem style={style} onTouchTap={this.kill} primaryText='Terminate Crawl'/>,
            <MenuItem style={style} onTouchTap={this.deleteJob} primaryText='Delete'/>,
          ]}
        />
      </IconMenu>
    )

    return (
      <ListItem
        key={`hjiLI-${this.props.jobId}`}
        disabled={true}
        primaryText={<HeritrixJobInfo jobId={this.props.jobId} runs={this.state.runs}/>}
        rightIconButton={rightIconMenu}
      />
    )
  }
}
