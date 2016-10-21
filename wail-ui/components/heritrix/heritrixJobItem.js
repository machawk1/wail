import React, {Component, PropTypes} from 'react'
import {shell, remote, ipcRender as ipc} from 'electron'
import { Textfit } from 'react-textfit'
import {grey400} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import cp from 'child_process'
import path from 'path'
import autobind from 'autobind-decorator'
import wc from '../../constants/wail-constants'
import CrawlStore from '../../stores/crawlStore'
import CrawlDispatcher from '../../dispatchers/crawl-dispatcher'
import {forceCrawlFinish, restartJob, rescanJobDir} from '../../actions/heritrix-actions'
import shallowCompare from 'react-addons-shallow-compare'
import {TableRow, TableRowColumn} from 'material-ui/Table'
import moment from 'moment'
import {joinStrings} from 'joinable'
import styles from '../styles/styles'
import GMessageDispatcher from '../../dispatchers/globalMessageDispatcher'

const style = {
  cursor: 'pointer'
}

const {
  crawlUrlS,
  statusS,
  timestampS,
  discoveredS,
  queuedS,
  downloadedS,
  actionS
} = styles.heritrixTable

const settings = remote.getGlobal('settings')

export default class HeritrixJobItem extends Component {

  static propTypes = {
    jobId: PropTypes.number.isRequired,
    runs: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    urls: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]).isRequired
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
    console.log('updating runs')
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
    forceCrawlFinish(this.props.jobId, this.props.urls)
  }

  @autobind
  rmJob (jpath, stopWatching = false) {
    if (stopWatching) {
      ipc.send('stop-watching-job', this.props.jobId)
    }
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
      cp.exec(`rm -rf ${jpath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
        rescanJobDir()
        CrawlDispatcher.dispatch({
          type: wc.EventTypes.CRAWL_JOB_DELETED,
          jobId: this.props.jobId
        })
      })
    }
  }

  @autobind
  deleteJob (event) {
    // console.log('Deleting Job')
    let runs = this.state.runs
    let jPath = `${settings.get('heritrixJob')}${path.sep}${this.props.jobId}`
    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        // console.log('We have runs and the running one has not ended')
        forceCrawlFinish(this.props.jobId, this.props.urls, () => {
          this.rmJob(jPath, true)
        })
      } else {
        // console.log('We have runs and the run has ended')
        this.rmJob(jPath)
      }
    } else {
      // console.log('We have no runs delete ok')
      this.rmJob(jPath)
    }
  }

  @autobind
  viewInHeritrix () {
    console.log(`${settings.get('heritrix.web_ui')}/job/${this.props.jobId}`)
    shell.openExternal(`${settings.get('heritrix.web_ui')}/engine/job/${this.props.jobId}`)
  }

  render () {
    const actionIcon = (
      <IconButton
        key={`HJIR-${this.props.jobId}-actionButton`}
        touch
      >
        <MoreVertIcon color={grey400} />
      </IconButton>
    )

    const rightIconMenu = (
      <IconMenu
        key={`HJIR-${this.props.jobId}-actionButton-menu`}
        iconButtonElement={actionIcon}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem style={style} onTouchTap={this.viewConf} primaryText='View Config' />
        <MenuItem style={style} onTouchTap={this.viewInHeritrix} primaryText='View In Heritrix' />
        <Divider />
        <MenuItem style={style} onTouchTap={this.start} primaryText='Start' />
        <MenuItem style={style} onTouchTap={this.restart} primaryText='Restart' />
        <MenuItem style={style} onTouchTap={this.kill} primaryText='Terminate Crawl' />
        <MenuItem style={style} onTouchTap={this.deleteJob} primaryText='Delete' />
      </IconMenu>
    )

    let runs = this.props.runs
    var url
    if (Array.isArray(this.props.urls)) {
      url = joinStrings(...this.props.urls, { separator: ' ' })
    } else {
      url = this.props.urls
    }
    if (runs.length > 0) {
      let job = runs[ 0 ]
      let status = job.ended ? 'Ended' : 'Running'
      let discovered = job.discovered || ''
      let queued = job.queued || ''
      let downloaded = job.downloaded || ''
      if (job.ended) {
        GMessageDispatcher.dispatch({
          title: 'Crawl Finished!',
          level: 'success',
          message: `Crawl for ${url} has finished`,
          uid: `Crawl for ${url} has finished`,
          autoDismiss: 0
        })
      }
      // console.log('the job being displayed', job)
      return (
        <TableRow key={`${this.props.jobId}-TableRow`}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={crawlUrlS}>
            <Textfit mode='multi'
              min={10}
            >{url}</Textfit>
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={statusS}>
            {status}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={timestampS}>
            {moment(job.timestamp).format('MMM DD YYYY h:mma')}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={discoveredS}>
            {discovered}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={queuedS}>
            {queued}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={downloadedS}>
            {downloaded}
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Action`} style={actionS}>
            {rightIconMenu}
          </TableRowColumn>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={`${this.props.jobId}-TableRow`}>
          <TableRowColumn key={`${this.props.jobId}-TRCol-JID`} style={crawlUrlS}>
            <p>{url}</p>
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Stat`} style={statusS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Tstamp`} style={timestampS}>
            Not Started
          </TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Discov`} style={discoveredS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Que`} style={queuedS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Dld`} style={downloadedS}>0</TableRowColumn>
          <TableRowColumn key={`${this.props.jobId}-TRCol-Action`} style={actionS}>
            {rightIconMenu}
          </TableRowColumn>
        </TableRow>
      )
    }
  }
}
