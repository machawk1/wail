import React, { PropTypes } from 'react'
import IconButton from 'material-ui/IconButton'
import Info from 'material-ui/svg-icons/action/info'
import { connect } from 'react-redux'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'

const stateToProps = state => ({
  crawlIconVisible: state.get('runningCrawls') > 0 ? 'visible' : 'hidden'
})

const enhance = onlyUpdateForKeys(['crawlIconVisible'])

const CrawlingIndicator = enhance(({crawlIconVisible}) => (
  <IconButton
    style={{visibility: crawlIconVisible}}
    tooltip='Crawl Running'
    tooltipPosition='bottom-left'
  >
    <Info />
  </IconButton>
))

CrawlingIndicator.propTypes = {
  crawlIconVisible: PropTypes.string.isRequired
}

export default connect(stateToProps)(CrawlingIndicator)
