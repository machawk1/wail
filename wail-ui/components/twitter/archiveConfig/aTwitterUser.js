import React, { Component, PropTypes } from 'react'
import { Card, CardTitle } from 'material-ui/Card'
import { SubmissionError } from 'redux-form'
import { ipcRenderer as ipc } from 'electron'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'
import timeVales from './timeValues'
import UserBasic from './twitterUser/userBasic'
import { notifyError, notifyInfo } from '../../../actions/notification-actions'

const monitor = (config) => {
  let message = `Monitoring ${config.account} for ${config.duration} to ${config.forCol} Now!`
  notifyInfo(message)
  ipc.send('monitor-twitter-account', config)
  window.logger.info(message)
}

const width = process.platform === 'win32' ? '40%' : '35%'
const enhance = onlyUpdateForKeys([ 'cols', 'times' ])// namedUpdateKeys('ATwitterUser', [ 'cols', 'times' ])

class ATwitterUser extends Component {
  static propTypes = {
    cols: PropTypes.array,
    times: PropTypes.array,
    onUnMount: PropTypes.func,
    clear: PropTypes.func
  }

  componentWillUnmount () {
    this.props.onUnMount()
  }

  submit (values) {
    let screenName = values.get('screenName')
    if (screenName.startsWith('@')) {
      screenName = screenName.substr(1)
    }
    return global.twitterClient.getUserId({ screen_name: screenName })
      .catch(error => {
        console.error(error)
        notifyError(`An internal error occurred ${error.message || ''}`, true)
      })
      .then(({ data, resp }) => {
        if (data.errors) {
          notifyError(`Invalid Screen Name: ${values.get('userName')} does not exist`)
          throw new SubmissionError({
            userName: `${values.get('userName')} does not exist`,
            _error: 'Invalid Screen Name'
          })
        }
        if (!this.props.cols.includes(values.get('forCol'))) {
          let message = `The Collection ${values.get('forCol')} does not exist`
          notifyError(message)
          throw new SubmissionError({
            forCol: message,
            _error: message
          })
        } else {
          let conf = {
            account: screenName,
            dur: timeVales.values[ values.get('length') ],
            forCol: values.get('forCol'),
            taskType: 'UserTimeLine'
          }
          if (process.env.NODE_ENV === 'development') {
            // tehehehe sssshhhhh
            monitor({ ...conf, oneOff: true })
          } else {
            monitor(conf)
          }
          this.props.clear()
        }
      })
  }

  render () {
    return (
      <div style={{ width, height: '100%' }} id='timelineArchive'>
        <Card style={{ height: '100%' }}>
          <CardTitle title={"A User's Timeline"} />
          <UserBasic cols={this.props.cols} times={this.props.times} onSubmit={::this.submit} />
        </Card>
      </div>
    )
  }
}

export default enhance(ATwitterUser)
