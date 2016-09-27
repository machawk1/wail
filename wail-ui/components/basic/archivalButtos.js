import React, { Component, PropTypes } from 'react'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { findDOMNode } from 'react-dom'
import autobind from 'autobind-decorator'
import RaisedButton from 'material-ui/RaisedButton'
import ViewArchiveIcon from 'material-ui/svg-icons/image/remove-red-eye'
import UrlDispatcher from '../../dispatchers/url-dispatcher'
import wailConstants from '../../constants/wail-constants'
import CrawlDispatcher from '../../dispatchers/crawl-dispatcher'
import BasicColList from './basicCollectionList'
import ArchiveNowButton from 'material-ui/svg-icons/content/archive'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import IconButton from 'material-ui/IconButton'
import SearchIcon from 'material-ui/svg-icons/action/search'
import shallowCompare from 'react-addons-shallow-compare'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class ArchivalButtons extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      forCol: defForCol
    }

  }

  componentWillMount () {
    console.log('archival buttons cwm')
    ViewWatcher.on('basicColList-selected', this.updateForCol)
  }

  componentWillUnmount () {
    console.log('archival buttons cwum')
    ViewWatcher.removeListener('basicColList-selected', this.updateForCol)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }


  @autobind
  updateForCol (forCol) {
    console.log('archivalButtos got an updateForCol', forCol)
    this.setState({ forCol })
  }

  render () {
    //  <ToolbarTitle text='Collections:' style={{paddingLeft: '20px'}}/>
    return (
      <Toolbar style={{ backgroundColor: 'transparent' }}>
        <ToolbarGroup firstChild>
          <BasicColList />
          <IconButton tooltip="Select Collection From Available Collections">
            <SearchIcon/>
          </IconButton>
        </ToolbarGroup>
        <ToolbarGroup >
          <RaisedButton
            icon={<ViewArchiveIcon />}
            label='Check Local Collection'
            labelPosition='before'
            onMouseDown={() => {
              UrlDispatcher.dispatch({
                type: EventTypes.CHECK_URI_IN_ARCHIVE,
                forCol: this.state.forCol
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
                forCol: this.state.forCol
              })
            }}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}
