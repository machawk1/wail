import React, { Component, PropTypes } from "react"
import { ListItem } from "material-ui/List"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import { grey400 } from "material-ui/styles/colors"
import IconButton from "material-ui/IconButton"
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import Divider from 'material-ui/Divider'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import { Grid, Row, Column } from "react-cellblock"
import del from 'del'
import path from 'path'
import moment from 'moment'

import settings from '../../../settings/settings'
import wc from '../../../constants/wail-constants'
import EditorPopup from "../../editor/editor-popup"
import CrawlDispatcher from "../../../dispatchers/crawl-dispatcher"
import JobInfoDispatcher from "../../../dispatchers/jobInfoDispatcher"
import  { forceCrawlFinish, deleteHeritrixJob, restartJob } from '../../../actions/heritrix-actions'

const styles = {
  button: {
    margin: 12,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  text: {
    // fontSize: 'small',
    height: "100%"
  },
  tableHeaderCol: {
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  tableHeader: {
    borderBottomStyle: "none"
  },
  tableRowCol: {
    paddingLeft: "12px",
    paddingRight: "12px",
    wordWrap: "break-word",
    textOverflow: "none",
    whiteSpace: "normal",
  }
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
    this.makeItSoNumberOne = this.makeItSoNumberOne.bind(this)
  }

  makeItSoNumberOne (id) {
    let runs = this.state.runs
    let count = 0
    if (runs.length > 0) {
      // runs.sort((j1, j2) => j1.timestamp.isBefore(j2.timestamp))
      let job = runs[ 0 ]
      let status = job.ended ? "Ended" : "Running"
      let discovered = job.discovered || ''
      let queued = job.queued || ''
      let downloaded = job.downloaded || ''
      console.log('the job being displayed', job)

      return (
        <Table>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            style={styles.tableHeader}
          >
            <TableRow displayBorder={false}>
              <TableHeaderColumn style={styles.tableHeaderCol}>ID</TableHeaderColumn>
              <TableHeaderColumn style={styles.tableHeaderCol}>Status</TableHeaderColumn>
              <TableHeaderColumn style={styles.tableHeaderCol}>Timestamp</TableHeaderColumn>
              <TableHeaderColumn style={styles.tableHeaderCol}>Discovered</TableHeaderColumn>
              <TableHeaderColumn style={styles.tableHeaderCol}>Queued</TableHeaderColumn>
              <TableHeaderColumn style={styles.tableHeaderCol}>Downloaded</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            showRowHover={true}
          >
            <TableRow displayBorder={false}>
              <TableRowColumn style={styles.tableRowCol}>
                {id}
              </TableRowColumn>
              <TableRowColumn style={styles.tableRowCol}>
                {status}
              </TableRowColumn>
              <TableRowColumn style={styles.tableRowCol}>
                {moment(job.timestamp).format("MM/DD/YYYY h:mm:ssa")}
              </TableRowColumn>
              <TableRowColumn style={styles.tableRowCol}>
                {discovered.trim()}
              </TableRowColumn>
              <TableRowColumn style={styles.tableRowCol}>
                {queued.trim()}
              </TableRowColumn>
              <TableRowColumn style={styles.tableRowCol}>
                {downloaded.trim()}
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      )
    } else {
      return (
        <Grid flexible={true}>
          <Row>
            <Column width="1/6" style={styles.text}>
              <p>ID: {id}</p>
            </Column>
            <Column width="1/6" style={styles.text}>
              <p>Status: Not Started</p>
            </Column>
            <Column width="1/6" style={styles.text}>
              <p>Timestamp: Not Started</p>
            </Column>
            <Column width="1/6" style={styles.text}>
              <p>Discovered: 0</p>
            </Column>
            <Column width="1/6" style={styles.text}>
              <p>Queued: 0</p>
            </Column>
            <Column width="1/6" style={styles.text}>
              <p>Downloaded: 0</p>
            </Column>
          </Row>
        </Grid>
      )
    }
  }

  itemClicked (event) {
    console.log('clicked on jobitem')
    JobInfoDispatcher.dispatch({
      type: wc.EventTypes.VIEW_HERITRIX_JOB,
      state: this.state
    })
  }

  viewConf (event) {
    this.setState({ openEditor: !this.state.openEditor })
  }

  start (event) {
    console.log("stat")
    let runs = this.state.runs
    if (runs.length > 0) {
      if (runs[ 0 ].ended) {
        restartJob(this.state.jobId)
      }
    } else {
      restartJob(this.state.jobId)
    }

  }

  restart (event) {
    let runs = this.state.runs
    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        forceCrawlFinish(this.state.jobId, () => restartJob(this.state.jobId))
      } else {
        restartJob(this.state.jobId)
      }
    }

  }

  kill (event, cb) {
    forceCrawlFinish(this.state.jobId, cb)
  }

  deleteJob (event) {
    let runs = this.state.runs
    let cb = () => {

      del([ `${settings.get('heritrixJob')}${path.sep}${this.state.jobId}` ], { force: true })
        .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))

    }
    cb = cb.bind(this)
    if (runs.length > 0) {
      if (!runs[ 0 ].ended) {
        console.log("We have runs and the running one has not ended")
        deleteHeritrixJob(this.state.jobId, cb)
      } else {
        console.log("We have runs and the run has ended")
      }
    } else {
      console.log("We have no runs delete ok")
      deleteHeritrixJob(this.state.jobId, cb)
    }

    CrawlDispatcher.dispatch({
      type: wc.EventTypes.CRAWL_JOB_DELETED,
      jobId: this.state.jobId
    })
  }

  onOpenChange (event) {
    this.setState({ openEditor: !this.state.openEditor })
  }

  render () {
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

    let cp = `${settings.get('heritrixJob')}/${this.props.jobId}/crawler-beans.cxml`
    let id = this.props.jobId

    // primaryText={this.makeItSoNumberOne(this.state.jobId)}
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
