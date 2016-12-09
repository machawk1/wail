import React, {Component} from 'react'
import IconButton from 'material-ui/IconButton'
import Info from 'material-ui/svg-icons/action/info'
import {connect} from 'react-redux'

const stateToProps = state => ({
  crawlIconVisible: state.get('runningCrawls') > 0 ? 'visible' : 'hidden'
})

class CrawlingIndicator extends Component {
  render () {
    return (
      <IconButton
        style={{visibility: this.props.crawlIconVisible}}
        tooltip='Crawl Running'
        tooltipPosition='bottom-left'
      >
        <Info />
      </IconButton>
    )
  }

}

export default connect(stateToProps)(CrawlingIndicator)
