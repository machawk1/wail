import React, {Component, PropTypes} from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import {Link, IndexLink} from 'react-router'
import FlatButton from 'material-ui/FlatButton'
import {Flex} from 'react-flex'
import {resetCheckMessage} from '../../../../actions/archival'
import {connect} from 'react-redux'

const dispatchToProp = dispatch => ({
  nukeCheckUrl () {
    dispatch(resetCheckMessage())
  }
})

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
    <Flex row alignItems='center' justifyContent='space-between'>
      <CardTitle
        title={title}
      />
      <Link to={`Collections/${col}/addSeed/fs`}><FlatButton primary label='From Filesystem' /></Link>
    </Flex>
  )
}
CollAddSeedHeader.propTypes = {
  col: PropTypes.string.isRequired
}
CollAddSeedHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default connect(null, dispatchToProp)(CollAddSeedHeader)
