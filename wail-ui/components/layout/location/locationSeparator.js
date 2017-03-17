import React from 'react'
import {darkWhite as theColor} from 'material-ui/styles/colors'
import {namedPure} from '../../../util/recomposeHelpers'

const enhance = namedPure('LocationSeparator')

const LocationSeparator = () => (
  <span style={{color: theColor}}>&gt;</span>
)

export default enhance(LocationSeparator)