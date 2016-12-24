import React, { Component, PropTypes } from 'react'
import { compose, branch, setDisplayName, renderComponent, shouldUpdate } from 'recompose'
import { SSRecord } from '../../../records'
import { CheckStepContent } from '../../../shared/checkStepContents'

const WaybackNotStarted = () => (
  <span>Wayback is waiting to be started</span>
)

const WaybackStartError = ({ serviceRec }) => {
  const { where, error } = serviceRec.get('wStartErReport')
  return (
    <span>
      Wayback Could Not Be Started <br/>
      {where} : {error}
    </span>
  )
}

class WaybackMessages extends Component {

  messaage () {
    const { serviceRec } = this.props
    if (serviceRec.get('hStarted')) {
      if (serviceRec.get('wStarted')) {

      }
    }
  }

  render () {
    return (
      <div>

      </div>
    )
  }
}

