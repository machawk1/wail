import React, {Component} from 'react'
import autobind from 'autobind-decorator'
import CrawlStore from '../../stores/crawlStore'
import IconButton from 'material-ui/IconButton'
import Notification from 'material-ui/svg-icons/action/info'

export default class CrawlingIndicator extends Component {
  constructor (...args){
    super(...args)
    this.state = {
      crawlIconVisible: 'hidden'
    }
  }

  componentWillMount () {
    CrawlStore.on('maybe-toggle-ci',this.maybeToggleCrawlIcon)
  }

  componentWillUnmount () {
    CrawlStore.removeListener('maybe-toggle-ci',this.maybeToggleCrawlIcon)
  }

  @autobind
  maybeToggleCrawlIcon(started = false){
    if(started && this.state.crawlIconVisible === 'hidden') {
      this.setState({crawlIconVisible: 'visible'})
    } else {
      if(this.state.crawlIconVisible === 'visible') {
        this.setState({crawlIconVisible: 'hidden'})
      }
    }
  }

  render () {
    return (
      <IconButton
        style={{visibility: this.state.crawlIconVisible}}
        tooltip='Crawl Running'
        tooltipPosition='bottom-left'
      >
        <Notification />
      </IconButton>
    )
  }

}

