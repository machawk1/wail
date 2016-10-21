import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import RaisedButton from 'material-ui/FlatButton'
import CardActions from 'material-ui/Card/CardActions'
import wailConstants from '../../../constants/wail-constants'
import CrawlDispatcher from '../../../dispatchers/crawl-dispatcher'
import UrlDispatcher from '../../../dispatchers/url-dispatcher'
import ViewWatcher from '../../../../wail-core/util/viewWatcher'

const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class ArchivalButtons extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  @autobind
  crawlNow () {
    CrawlDispatcher.dispatch({
      type: EventTypes.BUILD_CRAWL_JOB,
      from: From.BASIC_ARCHIVE_NOW
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
          onMouseDown={() => {
            UrlDispatcher.dispatch({
              type: EventTypes.CHECK_URI_IN_ARCHIVE
            })
          }}
        />
      </CardActions>
    )
  }
}
