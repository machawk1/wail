import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux/es'
import { SubmissionError, reset as resetForm } from 'redux-form'
import { ipcRenderer as ipc } from 'electron'
import MenuItem from 'material-ui/MenuItem'
import timeValues from './timeValues'
import ArchiveTwitterForm from './ArchiveTwitterForm'
import Card from 'material-ui/Card/Card'
import CardTitle from 'material-ui/Card/CardTitle'
import { notifyError, notifyInfo } from '../../../actions/notification-actions'

function monitor (config, message) {
  notifyInfo(message)
  ipc.send('monitor-twitter-account', config)
  window.logger.info(message)
}

function stateToProps (state) {
  return {
    cols: state.get('collections')
  }
}

function dispatchToProps (dispatch) {
  return bindActionCreators({
    clear () {
      return resetForm('archiveTwitter')
    }
  }, dispatch)
}

function makeTimeValues () {
  return timeValues.times.map((time, i) =>
    <MenuItem
      value={time}
      key={`${i}-${time}-timeVal`}
      primaryText={time}
    />
  )
}

class ArchiveTwitter extends Component {
  static propTypes = {
    clear: PropTypes.func.isRequired
  }

  constructor (...args) {
    super(...args)
    this.submit = this.submit.bind(this)
  }

  makeColNames () {
    return this.props.cols.keySeq().map((colName, i) => {
      return (
        <MenuItem
          key={`${i}-${colName}-mi`}
          value={colName}
          primaryText={colName}
        />
      )
    })
  }

  submit (values) {
    let screenName = values.get('screenName')
    if (screenName.startsWith('@')) {
      screenName = screenName.substr(1)
    }
    return global.twitterClient.getUserId({screen_name: screenName})
      .catch(error => {
        console.error(error)
        notifyError(`An internal error occurred ${error.message || ''}`, true)
      })
      .then(({data, resp}) => {
        if (data.errors) {
          notifyError(`Invalid Screen Name: ${values.get('userName')} does not exist`)
          throw new SubmissionError({
            userName: `${values.get('userName')} does not exist`,
            _error: 'Invalid Screen Name'
          })
        }
        let config
        let message
        let hts = values.get('searchT')
        if (hts && hts.size > 0) {
          hts = hts.toJS().filter(it => it !== '')
          if (hts.length > 0) {
            config = {
              account: screenName,
              dur: timeValues.values[values.get('length')],
              forCol: values.get('forCol'),
              lookFor: hts.length > 1 ? hts : hts[0],
              configOpts: {count: 100},
              taskType: 'TextSearch'
            }
            message = `Monitoring @${config.account} For ${hts.length} ${hts.length > 1 ? 'Words' : 'Word'} In Tweets For ${values.get('length')}. Tweets Added To ${config.forCol}!`
          } else {
            config = {
              account: screenName,
              dur: timeValues.values[values.get('length')],
              forCol: values.get('forCol'),
              taskType: 'UserTimeLine'
            }
            message = `You Did Not Specify Words To Look For. Monitoring @${config.account}'s Timeline For ${values.get('length')}. Tweets Added To ${config.forCol}!`
          }
          // console.log(config)
        } else {
          config = {
            account: screenName,
            dur: timeValues.values[values.get('length')],
            forCol: values.get('forCol'),
            taskType: 'UserTimeLine'
          }
          message = `Monitoring @${config.account}'s Timeline For ${values.get('length')}. Tweets Added To ${config.forCol}!`
        }
        if (process.env.NODE_ENV === 'development') {
          // tehehehe sssshhhhh
          monitor({...config, oneOff: true}, message)
        } else {
          monitor(config, message)
        }
        this.props.clear()
      })
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return this.props.cols !== nextProps.cols
  }

  componentWillUnmount () {
    this.props.clear()
  }

  render () {
    const cols = this.makeColNames()
    const times = makeTimeValues()
    return (
      <div className='widthHeightHundoPercent'>
        <div className='wail-container inheritThyWidthHeight' >
          <Card id='twitterFormCard' style={{marginTop: 15, height: '55%' }}>
            <CardTitle title='Monitoring &amp; Archiving Configuration' style={{paddingBottom: 0}} />
            <ArchiveTwitterForm cols={cols} times={times} onSubmit={this.submit} />
          </Card>
        </div>
      </div>
    )
  }
}

export default connect(stateToProps, dispatchToProps)(ArchiveTwitter)
