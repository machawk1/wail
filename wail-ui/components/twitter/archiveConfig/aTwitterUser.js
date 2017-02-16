import React, { Component, PropTypes } from 'react'
import { Card, CardTitle } from 'material-ui/Card'
import { Field, reduxForm } from 'redux-form/immutable'
import { SubmissionError, reset as resetForm } from 'redux-form'
import { ipcRenderer as ipc } from 'electron'
import timeVales from './timeValues'
import UserBasic from './twitterUser/userBasic'
import MaybeHashtags from './twitterUser/maybeHashTags'
import { notifyError, notifyInfo } from '../../../actions/notification-actions'

const monitor = (config) => {
  let message = `Monitoring ${config.account} for ${config.duration} to ${config.forCol} Now!`
  notifyInfo(message)
  ipc.send('monitor-twitter-account', config)
  window.logger.info(message)
}

const width = process.platform === 'win32' ? '40%' : '35%'

class ATwitterUser extends Component {
  static contextTypes = {
    store: PropTypes.object
  }

  constructor (...args) {
    super(...args)
    this.state = {
      page: 1
    }

    this.cols = Array.from(this.context.store.getState().get('collections').values())
      .map((col, i) => col.get('colName'))
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
        } else {
          let config
          let hts = values.get('hashtags')
          if (hts && hts.size > 0) {
            config = {
              account: screenName,
              dur: timeVales.values[values.get('length')],
              forCol: values.get('forCol'),
              extractor: {
                type: 'HashTags',
                hts: hts.toArray()
              },
              taskType: 'UserTimeLine'
            }
          } else {
            config = {
              account: screenName,
              dur: timeVales.values[values.get('length')],
              forCol: values.get('forCol'),
              extractor: {
                type: 'TimeLine'
              },
              taskType: 'UserTimeLine'
            }
          }
          console.log(config)
          monitor(config)
          this.context.store.dispatch(resetForm('aTwitterUser'))
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
      <div style={{width, height: '100%'}} id='twitterArchive'>
        <Card style={{height: '100%'}}>
          <CardTitle title={"A User's Timeline"}/>
          {page === 1 && <UserBasic cols={this.cols} onSubmit={::this.nextPage}/>}
          {page === 2 && <MaybeHashtags previousPage={::this.previousPage} onSubmit={::this.submit}/>}
        </Card>
      </div>
    )
  }
}

export default ATwitterUser
