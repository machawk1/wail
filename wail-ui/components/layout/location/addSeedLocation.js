import React, { PropTypes } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import routeNames, { dynamicRouteResolvers as drr } from '../../../routes/routeNames'
import linkStyle from './linkStyle'
import LocationSeparator from './locationSeparator'
import { resetCheckMessage } from '../../../actions/archival'

const dispatchToProp = dispatch => ({
  nukeCheckUrl () {
    dispatch(resetCheckMessage())
  }
})

const AddSeedLocation = ({match, nukeCheckUrl}) => (
  <span style={{margin: 0, padding: 0}}>
    <Link onClick={nukeCheckUrl} style={linkStyle} to={routeNames.selectCol}>Collections</Link>&nbsp;
    <LocationSeparator/>&nbsp;
    <Link style={linkStyle} onClick={nukeCheckUrl} to={drr.viewCollection(match.params.col)}>{match.params.col}</Link>&nbsp;
    <LocationSeparator/>&nbsp;
    Add Seed
  </span>
)

AddSeedLocation.propTypes = {
  nukeCheckUrl: PropTypes.func.isRequired
}

export default connect(null, dispatchToProp)(AddSeedLocation)
