import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import * as colors from 'material-ui/styles/colors'
import RaisedButton from 'material-ui/FlatButton'
import CardActions from 'material-ui/Card/CardActions'
import wailConstants from '../../../constants/wail-constants'
import CrawlDispatcher from '../../../dispatchers/crawl-dispatcher'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'


const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class ArchivalButtons extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

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

  @autobind
  crawlNow() {
    console.log('crawaling now for collection',this.state.forCol)
    CrawlDispatcher.dispatch({
      type: EventTypes.BUILD_CRAWL_JOB,
      from: From.BASIC_ARCHIVE_NOW,
      forCol: this.state.forCol
    })
  }

  render () {
    //  <ToolbarTitle text='Collections:' style={{paddingLeft: '20px'}}/>
   /*
    <BasicColList />
    <IconButton tooltip="Select Collection From Available Collections">
    <SearchIcon/>
    </IconButton>
    */
    let {muiTheme} = this.context
    return (
      <CardActions>
        <RaisedButton
          primary
          label='Archive Via Heritrix!'
          labelPosition='before'
          onMouseDown={this.crawlNow}
        />
        <RaisedButton
          primary
          label='Check Local Collection'
          labelPosition='before'
        />
      </CardActions>
    )
  }
}
