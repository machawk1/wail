import React, { Component, PropTypes } from 'react'
import { Row } from 'react-flexbox-grid'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Avatar from 'material-ui/Avatar'
import ServiceIcon from 'material-ui/svg-icons/action/timeline'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import styles from '../styles/styles'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import { Link, IndexLink } from 'react-router'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import AutoComplete from 'material-ui/AutoComplete'
import CrawlStore from '../../stores/crawlStore'
import SearchIcon from 'material-ui/svg-icons/action/search'
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar'

export default class Header extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = { open: false, location: 'WAIL', crawlIconVisible: 'hidden' }
  }

  @autobind
  handleToggle () {
    this.setState({ open: !this.state.open })
  }

  componentWillMount () {
    CrawlStore.on('maybe-toggle-ci', this.maybeToggleCrawlIcon)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('maybe-toggle-ci', this.maybeToggleCrawlIcon)
  }

  @autobind
  maybeToggleCrawlIcon (started = false) {
    if (started && this.state.crawlIconVisible === 'hidden') {
      this.setState({ crawlIconVisible: 'visible' })
    } else {
      if (this.state.crawlIconVisible === 'visible') {
        this.setState({ crawlIconVisible: 'hidden' })
      }
    }
  }

  @autobind
  open (open) {
    this.setState({ open })
  }

  @autobind
  handleClose (toWhere) {
    this.setState({ open: false, location: toWhere })
  }

  render () {
    return (
      <AppBar
        title={'WAIL'}
        iconStyleRight={{width: '40%'}}
        iconElementRight={
          <AutoComplete
            fullWidth
            hintText='🔎 Search... '
            id="autocomplete"
            dataSource={[ 'Test1', 'Test2', 'Test3', 'John', 'Ringo', 'Paul' ]}
            filter={AutoComplete.fuzzyFilter}
          />
        }
      />
    )
  }
}