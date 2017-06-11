import React from 'react'
import PropTypes from 'prop-types'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import CardActions from 'material-ui/Card/CardActions'
import FlatButton from 'material-ui/FlatButton'
import { connect } from 'react-redux'
import { remote } from 'electron'
import { bindActionCreators } from 'redux'
import { openFSLocation, openUrlInBrowser } from '../../actions/util-actions'
import * as heritrixActions from '../../actions/heritrix'
import { namedUpdateKeys } from '../../util/recomposeHelpers'
import { heritrix, general } from '../../constants/uiStrings'

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

const enhance = namedUpdateKeys('HeritrixActionMenu', ['jobId', 'i'])

const HeritrixActionMenu = ({jobId, i, viewConf, viewInHeritrix, startJob, restartJob, terminateJob, deleteJob}) => (
  <IconMenu
    id={`hactions${i}`}
    key={`HJIR-${jobId}-actionButton-menu`}
    iconButtonElement={
      <IconButton
        key={`HJIR-${jobId}-actionButton`}
        touch
      >
        <MoreVertIcon color={grey400} />
      </IconButton>
    }
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <div id={`hjicm${i}`}>
      <MenuItem style={style} onTouchTap={viewConf} primaryText={heritrix.viewConf} />
      <MenuItem style={style} onTouchTap={viewInHeritrix} primaryText={heritrix.viewInHeritrix} />
      <Divider />
      <MenuItem style={style} onTouchTap={startJob} primaryText={general.start} />
      <MenuItem style={style} onTouchTap={restartJob} primaryText={general.restart} />
      <MenuItem style={style} onTouchTap={terminateJob} primaryText={heritrix.terminateCrawl} />
      <MenuItem style={style} onTouchTap={deleteJob} primaryText={general.delete} />
    </div>
  </IconMenu>
)

HeritrixActionMenu.propTypes = {
  jobId: PropTypes.number.isRequired,
  i: PropTypes.number.isRequired,
  startJob: PropTypes.func.isRequired,
  restartJob: PropTypes.func.isRequired,
  terminateJob: PropTypes.func.isRequired,
  deleteJob: PropTypes.func.isRequired,
  viewInHeritrix: PropTypes.func.isRequired,
  viewConf: PropTypes.func.isRequired
}

const HeritrixActionMenu2 = ({jobId, i, viewConf, viewInHeritrix, startJob, restartJob, terminateJob, deleteJob}) => (
  <CardActions
    id={`hactions${i}`}
    key={`HJIR-${jobId}-actionButton-menu`}
  >
    <FlatButton onTouchTap={viewConf} label='View Config' />
    <FlatButton onTouchTap={viewInHeritrix} label='View In Heritrix' />
    <FlatButton onTouchTap={startJob} label='Start' />
    <FlatButton onTouchTap={restartJob} label='Restart' />
    <FlatButton onTouchTap={terminateJob} label='Terminate Crawl' />
    <FlatButton onTouchTap={deleteJob} label='Delete' />
  </CardActions>
)

HeritrixActionMenu2.propTypes = {
  jobId: PropTypes.number.isRequired,
  i: PropTypes.number.isRequired,
  startJob: PropTypes.func.isRequired,
  restartJob: PropTypes.func.isRequired,
  terminateJob: PropTypes.func.isRequired,
  deleteJob: PropTypes.func.isRequired,
  viewInHeritrix: PropTypes.func.isRequired,
  viewConf: PropTypes.func.isRequired
}

export default connect(null, dispatchBind, mergeProps)(enhance(HeritrixActionMenu))

// export default connect(null, dispatchBind, mergeProps)(enhance(HeritrixActionMenu))
