import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar'
import AutoComplete from 'material-ui/AutoComplete'
import CrawlStore from '../../stores/crawlStore'

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
            id='autocomplete'
            dataSource={[ 'Test1', 'Test2', 'Test3', 'John', 'Ringo', 'Paul' ]}
            filter={AutoComplete.fuzzyFilter}
          />
        }
      />
    )
  }
}
