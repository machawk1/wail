import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Immutable from 'immutable'
import { connect } from 'react-redux'
import { blueGrey700 as cHeaderTextColor } from 'material-ui/styles/colors'
import Card from 'material-ui/Card/Card'
import CardHeader from 'material-ui/Card/CardHeader'
import CardText from 'material-ui/Card/CardText'
import Flexbox from 'flexbox-react'

const headTextStyle = {color: cHeaderTextColor, textDecoration: 'none', textAlign: 'center'}


function stateToProps (state, ownProps) {
  return {jobRecord: state.get('wailCrawls').getJob(ownProps.jobId)}
}

class WailCrawlJob extends Component {
  static propTypes = {
    jobId: PropTypes.string.isRequired,
    i: PropTypes.number.isRequired,
    jobRecord: PropTypes.instanceOf(Immutable.Record).isRequired,
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.jobId !== nextProps.jobId || this.props.jobRecord !== nextProps.jobRecord
  }

  render () {
    const {jobId, jobRecord} = this.props
    return (
      <Card
        id={`wji${this.props.i}`}
        key={`${jobId}-card-${this.props.i}`}
        style={{
          margin: 5
        }}
      >
        <CardHeader
          title={jobRecord.uri_r}
          subtitle={jobRecord.type}
          titleStyle={headTextStyle}
        />
        <CardText>
          <Flexbox
            flexGrow={1}
            flexDirection='row'
            flexWrap='wrap'
            justifyContent='space-between'
          >
            <span style={{marginBottom: 3}}>Collection: {jobRecord.forCol}</span>
            <span>To Crawl: {jobRecord.queued}</span>
          </Flexbox>
          <Flexbox
            flexGrow={1}
            flexDirection='row'
            flexWrap='wrap'
            justifyContent='space-between'
          >
            <span style={{marginBottom: 3}}>{jobRecord.status()}</span>
            <span>Updated: {jobRecord.lastUpdated}</span>
          </Flexbox>
        </CardText>
      </Card>
    )
  }
}

export default connect(stateToProps)(WailCrawlJob)

