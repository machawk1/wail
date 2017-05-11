import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import routeNames from '../../../routes/routeNames'
import LocationSeparator from './locationSeparator'
import linkStyle from './linkStyle'
import { general } from '../../../constants/uiStrings'

const CollectionViewLocation = ({match}) => (
  <span id='colViewLoc' style={{margin: 0, padding: 0}}><Link to={routeNames.selectCol}
                                                              style={linkStyle}>{general.collections}</Link> {
    <LocationSeparator />} {match.params.col}</span>
)

export default CollectionViewLocation
