import React, { Component, PropTypes } from 'react'
import { Card, CardTitle } from 'material-ui/Card'
import { Field, reduxForm } from 'redux-form/immutable'
import { SubmissionError, reset as resetForm } from 'redux-form'
import { ipcRenderer as ipc } from 'electron'
import timeVales from './timeValues'
import UserBasic from './textSearch/userBasic'
import SearchTerms from './textSearch/searchTerms'
import { notifyError, notifyInfo } from '../../../actions/notification-actions'

const monitor = (config) => {
  let message = `Monitoring ${config.account} for ${config.forCol} Now!`
  notifyInfo(message)
  ipc.send('monitor-twitter-account', config)
  window.logger.debug(message)
}

const width = process.platform === 'win32' ? '40%' : '35%'

class TwitterUserTextSearch extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor (...args) {
    super(...args)
    this.state = {
      page: 1
    }

    window.tutsN = this.nextPage.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.state.page !== nextState.page
  }

  submit (values) {
    let screenName = values.get('screenName')
    if (screenName.startsWith('@')) {
      screenName = screenName.substr(1)
    }
    return global.twitterClient.getUserId({screen_name: screenName})
      .catch(error => {
        console.error(error)
      })
      .then(({data, resp}) => {
        if (data.errors) {
          notifyError(`Invalid Screen Name: ${values.get('userName')} does not exist`)
          throw new SubmissionError({
            userName: `${values.get('userName')} does not exist`,
            _error: 'Invalid Screen Name'
          })
        }
        if (!this.cols.includes(values.get('forCol'))) {
          let message = `The Collection ${values.get('forCol')} does not exist`
          notifyError(message)
          throw new SubmissionError({
            forCol: message,
            _error: message
          })
        }
        let config
        let hts = values.get('searchT')
        if (hts && hts.size > 0) {
          config = {
            account: screenName,
            dur: timeVales.values[values.get('length')],
            forCol: values.get('forCol'),
            lookFor: hts.size > 1 ? hts.toJS() : hts.get(0),
            configOpts: {count: 100},
            taskType: 'TextSearch'
          }
          // console.log(config)
          monitor(config)
          this.context.store.dispatch(resetForm('twitterTextSearch'))
        } else {
          console.log('negative ghost rider')
        }
      })
  }

  nextPage () {
    this.setState({page: this.state.page + 1})
  }

  previousPage () {
    this.setState({page: this.state.page - 1})
  }

  render () {
    const {page} = this.state
    return (
      <div style={{width, height: '100%'}} id='tweetText'>
        <Card style={{height: '100%'}}>
          <CardTitle title={'Terms In Users Tweets'} />
          {page === 1 && <UserBasic cols={this.props.cols} times={this.props.times} onSubmit={::this.nextPage} />}
          {page === 2 && <SearchTerms previousPage={::this.previousPage} onSubmit={::this.submit} />}
        </Card>
      </div>
    )
  }
}

export default TwitterUserTextSearch
