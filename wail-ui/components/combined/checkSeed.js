import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import RaisedButton from 'material-ui/FlatButton'
import {
  formValueSelector
} from 'redux-form/immutable'
import {connect} from 'react-redux'
import isURL from 'validator/lib/isURL'
import partialRight from 'lodash/partialRight'
import {checkUrl} from '../../actions/redux/archival'
import CheckResults from './checkResults'
import {batchActions} from 'redux-batched-actions'
import Notifications from 'react-notification-system-redux'

const urlSelector = partialRight(formValueSelector('archiveUrl'), 'url')

const notificationOpts = {
  // uid: 'once-please', // you can specify your own uid if required
  level: 'info',
  title: 'Hey, it\'s good to see you!',
  message: 'Now you can see how easy it is to use notifications in React!',
  position: 'tr',
  autoDismiss: 0,
  action: {
    label: 'Click me!!',
    callback: () => alert('clicked!')
  }
}

class CheckSeed extends Component {
  static propTypes = {
    col: PropTypes.string.isRequired
  }
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }

  checkSeed () {
    let url = urlSelector(this.context.store.getState())
    if (isURL(url)) {
      this.props.doCheck(url, this.props.col)
    } else {
      console.log('its not a valid url')
    }
  }

  render () {
    console.log('checkSeed', this.props, this.context.store.getState())
    return (
      <div style={{ position: 'relative', marginRight: 25, 'zIndex': 0 }}>
        <div style={{ position: 'absolute', right: '75px', width: '350px' }}>
          <RaisedButton label='Check Seed' onTouchTap={::this.checkSeed} />
          <CheckResults />
        </div>
      </div>
    )
  }
}

export default connect(null, dispatch => ({
  doCheck (url, forCol) {
    dispatch(checkUrl(url, forCol))
  }
}))(CheckSeed)
