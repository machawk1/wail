import React, {Component, PropTypes} from 'react'
import { Textfit } from 'react-textfit'
import autobind from 'autobind-decorator'
import {ListItem} from 'material-ui/List'
import {grey400} from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import wailConstants from '../../constants/wail-constants'
import CrawlUrlsDispatcher from './crawlUrlsDispatcher'

const EventTypes = wailConstants.EventTypes

export default class CrawlUrlItem extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    idx: PropTypes.number.isRequired,
    num: PropTypes.number.isRequired
  }

  @autobind
  editCrawlUrl (event) {
    CrawlUrlsDispatcher.dispatch({
      type: EventTypes.NEW_CRAWL_EDITED_URL,
      url: this.props.url,
      idx: this.props.idx
    })
  }

  @autobind
  deleteMe (e) {
    CrawlUrlsDispatcher.dispatch({
      type: EventTypes.NEW_CRAWL_REMOVE_URL,
      url: this.props.url,
      idx: this.props.idx
    })
  }

  render () {
    const rightIconMenu = (
      <IconMenu iconButtonElement={<MoreVertIcon color={grey400} />}>
        <MenuItem onTouchTap={this.editCrawlUrl}>Edit</MenuItem>
        <MenuItem onTouchTap={this.deleteMe}>Delete</MenuItem>
      </IconMenu>
    )
    return (
      <ListItem
        key={this.props.num}
        primaryText={<Textfit>
          {this.props.url}
        </Textfit>
          }
        rightIconButton={rightIconMenu}
      />
    )
  }
}
