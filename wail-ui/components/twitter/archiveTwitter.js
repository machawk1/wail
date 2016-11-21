import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import {remote} from 'electron'

export default class ArchiveTwitter extends Component {
  static propTypes = {
    twitter: PropTypes.instanceOf(Immutable.Map).isRequired,
  }

  render () {
    return (
      <div>
        <p>We be archiving</p>
        <p>{JSON.stringify(this.props.twitter.toJS())}</p>
      </div>
    )
  }

}