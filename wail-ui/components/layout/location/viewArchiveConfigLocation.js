import React from 'react'
import { Link } from 'react-router-dom'
import LocationSeparator from './locationSeparator'
import routeNames, { dynamicRouteResolvers as drr } from '../../../routes/routeNames'
import linkStyle from './linkStyle'

const ViewArchiveConfigHeader = ({match}) => (
  <span style={{margin: 0, padding: 0}}>
    <Link style={linkStyle} to={routeNames.selectCol}>Collections</Link> {<LocationSeparator/>}
    <Link style={linkStyle} to={drr.viewCollection(match.params.col)}>{match.params.col}</Link> {<LocationSeparator/>}
    Archive Configuration
  </span>
)

export default ViewArchiveConfigHeader

