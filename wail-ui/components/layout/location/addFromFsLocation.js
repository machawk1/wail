import React, { PropTypes } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { batchActions } from 'redux-batched-actions'
import { resetCheckMessage } from '../../../actions/archival'
import { resetAddFSSeedMessage } from '../../../actions/addSeedFromFs'
import routeNames, { dynamicRouteResolvers as drr } from '../../../routes/routeNames'
import linkStyle from './linkStyle'
import LocationSeparator from './locationSeparator'

const dispatchToProp = dispatch => ({
  nukeCheckUrl () {
    dispatch(batchActions([resetCheckMessage(), resetAddFSSeedMessage()]))
  },
  nukeAddFsSeed () {
    dispatch(resetAddFSSeedMessage())
  }
})
/*
 let addSLink = <Link style={linkStyle} onClick={nukeAddFsSeed} to={drr.addSeed(match.params.col)}>Add
 Seed</Link>
 */
const AddFromFSLocation = ({match, nukeCheckUrl, nukeAddFsSeed}) => {
  let colsLink = <Link onClick={nukeCheckUrl} style={linkStyle} to={routeNames.selectCol}>Collections</Link>
  let colLink = <Link style={linkStyle} onClick={nukeCheckUrl}
                      to={drr.viewCollection(match.params.col)}>{match.params.col}</Link>


  return (
    <span style={{margin: 0, padding: 0}}>{colsLink} {<LocationSeparator/>} {colLink} {<LocationSeparator/>} Add Seed From Filesystem</span>
  )
}

AddFromFSLocation.propTypes = {
  nukeCheckUrl: PropTypes.func.isRequired,
  nukeAddFsSeed : PropTypes.func.isRequired
}

export default connect(null, dispatchToProp)(AddFromFSLocation)
