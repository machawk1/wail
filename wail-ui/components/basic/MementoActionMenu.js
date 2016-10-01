import React, {Component, PropTypes} from 'react'
import {shell, remote} from 'electron'
import {grey400} from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import ViewArchiveIcon from 'material-ui/svg-icons/image/remove-red-eye'
import CheckArchiveStatIcon from 'material-ui/svg-icons/action/schedule'
import ArchiveNowIcon from 'material-ui/svg-icons/content/archive'
import autobind from 'autobind-decorator'
import wailConstants from '../../constants/wail-constants'

const style = {
  cursor: 'pointer'
}

const From = wailConstants.From
const EventTypes = wailConstants.EventTypes
const settings = remote.getGlobal('settings')

export default class MementoActionMenu extends Component {

  static propTypes = {
    url: PropTypes.string.isRequired,
    archiving: PropTypes.bool.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      archiving: props.archiving
    }
  }

  componentWillMount () {

  }

  componentWillUnmount () {

  }

  @autobind
  viewStats (event) {
    console.log(`view stats ${this.props.url}`)
  }

  @autobind
  archiveNow (event) {
    console.log(`archiving now ${this.props.url}`)
    // CrawlDispatcher.dispatch({
    //   type: EventTypes.BUILD_CRAWL_JOB,
    //   from: From.MEMENTO_MENU,
    //   url: this.props.url
    // })
  }

  @autobind
  checkArchivalStatus (event) {
    console.log(`checking archival status ${this.props.url}`)
    // UrlDispatcher.dispatch({
    //   type: EventTypes.CHECK_URI_IN_ARCHIVE,
    //   url: this.props.url
    // })
  }

  @autobind
  viewArchive (event) {
    console.log(`view archive ${this.props.url}`)
    // UrlDispatcher.dispatch({
    //   type: EventTypes.VIEW_ARCHIVED_URI,
    //   url: this.props.url
    // })
  }

  render () {
    const actionIcon = (
      <IconButton
        key={`MAM-${this.props.url}-actionButton`}
        touch
      >
        <MoreVertIcon color={grey400} />
      </IconButton>
    )

    return (
      <IconMenu
        key={`MAM-${this.props.url}-actionButton-menu`}
        iconButtonElement={actionIcon}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        targetOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem
          style={style}
          onTouchTap={this.archiveNow}
          rightIcon={<ArchiveNowIcon />}
          primaryText='Archive Now'
        />
        <MenuItem
          style={style}
          onTouchTap={this.checkArchivalStatus}
          rightIcon={<CheckArchiveStatIcon />}
          primaryText='Check Archived Status'
        />
        <MenuItem
          style={style}
          onTouchTap={this.viewArchive}
          rightIcon={<ViewArchiveIcon />}
          primaryText='View Archive'
        />
      </IconMenu>
    )
  }
}
