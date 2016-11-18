import React, {Component, PropTypes} from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import {Link, IndexLink} from 'react-router'
import {resetCheckMessage} from '../../actions/redux/archival'
import {connect} from 'react-redux'

const CollAddSeedHeader = ({ col, nukeCheckUrl }, context) => {
  let { primary1Color } = context.muiTheme.baseTheme.palette
  let linkStyle = {
    color: primary1Color,
    textDecoration: 'none'
  }
  let title = <span><IndexLink onClick={nukeCheckUrl} style={linkStyle} to='/'>Collections</IndexLink> > <Link
    style={linkStyle}
    onClick={nukeCheckUrl}
    to={`Collections/${col}`}>{col}</Link> > Add Seed</span>
  return (
    <CardTitle title={title} />
  )
}
CollAddSeedHeader.propTypes = {
  col: PropTypes.string.isRequired
}
CollAddSeedHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default connect(null, dispatch => ({
  nukeCheckUrl () {
    dispatch(resetCheckMessage())
  }
}))(CollAddSeedHeader)

