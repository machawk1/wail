import PropTypes from 'prop-types'
import React, { Component } from 'react'
import RaisedButton from 'material-ui/FlatButton'
import { formValueSelector } from 'redux-form/immutable'
import { connect } from 'react-redux'
import isURL from 'validator/lib/isURL'
import partialRight from 'lodash/partialRight'
import { checkUrl } from '../../../../actions/archival'
import CheckResults from './checkResults'

const urlSelector = partialRight(formValueSelector('archiveUrl'), 'url')

const dispatchToProp = dispatch => ({
  doCheck (url) {
    dispatch(checkUrl(url))
  }
})

class CheckSeed extends Component {
  static propTypes = {
    col: PropTypes.string.isRequired
  }
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.checkSeed = this.checkSeed.bind(this)
  }

  checkSeed () {
    let url = urlSelector(this.context.store.getState())
    if (isURL(url)) {
      this.props.doCheck(url)
    } else {
      console.log('its not a valid url')
    }
  }

  render () {
    return (
      <div style={{position: 'relative', marginRight: 25}}>
        <div style={{position: 'absolute', right: 50, top: -225}}>
          <RaisedButton id='CheckSeedButton' label='Check Seed' onTouchTap={this.checkSeed} />
          <CheckResults />
        </div>
      </div>
    )
  }
}

export default connect(null, dispatchToProp)(CheckSeed)
