import React, { Component, PropTypes } from 'react'
import { Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import { findDOMNode } from 'react-dom'
import RaisedButton from 'material-ui/RaisedButton'
import ViewArchiveIcon from 'material-ui/svg-icons/image/remove-red-eye'
import UrlDispatcher from '../../dispatchers/url-dispatcher'
import wailConstants from '../../constants/wail-constants'
import CrawlDispatcher from '../../dispatchers/crawl-dispatcher'
import ReactTooltip from 'react-tooltip'
import DropDownMenu from 'material-ui/DropDownMenu'
import ArchiveNowButton from 'material-ui/svg-icons/content/archive'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class ArchivalButtons extends Component {
  static propTypes = {
    forCol: PropTypes.string,
    archiveList: PropTypes.node.isRequired
  }

  static defaultProps = {
    forCol: defForCol
  }

  constructor (...args) {
    super(...args)
  }

  render () {
    return (
      <Toolbar style={{ backgroundColor: 'transparent' }}>
        <ToolbarGroup firstChild>
          <ToolbarTitle text='Collections:' />
          {this.props.archiveList}
        </ToolbarGroup>
        <ToolbarGroup >
          <RaisedButton
            icon={<ViewArchiveIcon />}
            label='Check Local Collection'
            labelPosition='before'
            onMouseDown={() => {
              UrlDispatcher.dispatch({
                type: EventTypes.CHECK_URI_IN_ARCHIVE,
                forCol: this.props.forCol
              })
            }}
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <RaisedButton
            icon={<ArchiveNowButton />}
            label='Archive Via Heritrix!'
            labelPosition='before'
            onMouseDown={() => {
              CrawlDispatcher.dispatch({
                type: EventTypes.BUILD_CRAWL_JOB,
                from: From.BASIC_ARCHIVE_NOW,
                forCol: this.props.forCol
              })
            }}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
