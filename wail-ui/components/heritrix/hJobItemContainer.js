import React, {Component, PropTypes} from 'react'
import {remote} from 'electron'
import {grey400} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {connect} from 'react-redux'
import {openFSLocation, openUrlInBrowser} from '../../actions/util-actions'
import {bindActionCreators} from 'redux'
import * as heritrixActions from '../../actions/redux/heritrix'
import HertrixJobItem2 from './heritrixJobItem2'

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
  jobId: ownProps.jobId
})

class HJobItemContainer extends Component {
  static propTypes = {
    jobId: PropTypes.number.isRequired,
    startJob: PropTypes.func.isRequired,
    restartJob: PropTypes.func.isRequired,
    terminateJob: PropTypes.func.isRequired,
    deleteJob: PropTypes.func.isRequired,
    viewInHeritrix: PropTypes.func.isRequired,
    viewConf: PropTypes.func.isRequired
  }

  render () {
    const actionIcon = (
      <IconButton
        key={`HJIR-${this.props.jobId}-actionButton`}
        touch
      >
        <MoreVertIcon color={grey400}/>
      </IconButton>
    )

    const rightIconMenu = (
      <IconMenu
        key={`HJIR-${this.props.jobId}-actionButton-menu`}
        iconButtonElement={actionIcon}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem style={style} onTouchTap={this.props.viewConf} primaryText='View Config'/>
        <MenuItem style={style} onTouchTap={this.props.viewInHeritrix} primaryText='View In Heritrix'/>
        <Divider />
        <MenuItem style={style} onTouchTap={this.props.startJob} primaryText='Start'/>
        <MenuItem style={style} onTouchTap={this.props.restartJob} primaryText='Restart'/>
        <MenuItem style={style} onTouchTap={this.props.terminateJob} primaryText='Terminate Crawl'/>
        <MenuItem style={style} onTouchTap={this.props.deleteJob} primaryText='Delete'/>
      </IconMenu>
    )

    return (
      <HertrixJobItem2 jobId={this.props.jobId} actionMenu={rightIconMenu}/>
    )
  }
}

export default connect(null, dispatchBind, mergeProps)(HJobItemContainer)
