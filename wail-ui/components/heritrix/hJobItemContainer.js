import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { remote } from 'electron'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { openFSLocation, openUrlInBrowser } from '../../actions/util-actions'
import * as heritrixActions from '../../actions/heritrix'
import HertrixJobItem from './heritrixJobItem'
import rd from 'react-dom'

const style = {
  cursor: 'pointer'
}
const settings = remote.getGlobal('settings')

const dispatchBind = dispatch => bindActionCreators(heritrixActions, dispatch)

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  viewInHeritrix () {
    openUrlInBrowser(`${settings.get('heritrix.web_ui')}/engine/job/${ownProps.jobId}`)
  },
  viewConf () {
    openFSLocation(`${settings.get('heritrixJob')}/${ownProps.jobId}/crawler-beans.cxml`)
  },
  startJob () {
    dispatchProps.startJob(ownProps.jobId)
  },
  restartJob () {
    dispatchProps.restartJob(ownProps.jobId)
  },
  terminateJob () {
    dispatchProps.terminateJob(ownProps.jobId)
  },
  deleteJob () {
    dispatchProps.deleteJob(ownProps.jobId)
  },
  jobId: ownProps.jobId,
  i: ownProps.i
})

class HJobItemContainer extends Component {
  static propTypes = {
    jobId: PropTypes.number.isRequired,
    i: PropTypes.number.isRequired,
    startJob: PropTypes.func.isRequired,
    restartJob: PropTypes.func.isRequired,
    terminateJob: PropTypes.func.isRequired,
    deleteJob: PropTypes.func.isRequired,
    viewInHeritrix: PropTypes.func.isRequired,
    viewConf: PropTypes.func.isRequired
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.jobId !== nextProps.jobId
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
        id={`hactions${this.props.i}`}
        key={`HJIR-${this.props.jobId}-actionButton-menu`}
        iconButtonElement={actionIcon}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <div id={`hjicm${this.props.i}`}>
          <MenuItem style={style} onTouchTap={this.props.viewConf} primaryText='View Config' />
          <MenuItem style={style} onTouchTap={this.props.viewInHeritrix} primaryText='View In Heritrix' />
          <Divider />
          <MenuItem style={style} onTouchTap={this.props.startJob} primaryText='Start' />
          <MenuItem style={style} onTouchTap={this.props.restartJob} primaryText='Restart' />
          <MenuItem style={style} onTouchTap={this.props.terminateJob} primaryText='Terminate Crawl' />
          <MenuItem style={style} onTouchTap={this.props.deleteJob} primaryText='Delete' />
        </div>
      </IconMenu>
    )

    return (
      <HertrixJobItem i={this.props.i} jobId={this.props.jobId} actionMenu={rightIconMenu} />
    )
  }
}

export default connect(null, dispatchBind, mergeProps)(HJobItemContainer)
