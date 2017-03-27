import React, { Component, PropTypes } from 'react'
import { CardTitle } from 'material-ui/Card'
import { Link, IndexLink } from 'react-router'

const ViewArchiveConfigHeader = ({viewingCol}, context) => {
  const {primary1Color} = context.muiTheme.baseTheme.palette
  const linkStyle = {
    color: primary1Color,
    textDecoration: 'none'
  }
  const title = <span><IndexLink style={linkStyle} to='/'>Collections</IndexLink> > <Link
    style={linkStyle}
    to={`Collections/${viewingCol}`}>{viewingCol}</Link> > Archive Configuration</span>

  return (
    <CardTitle
      title={title}
    />
  )
}

ViewArchiveConfigHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

ViewArchiveConfigHeader.propTypes = {
  viewingCol: PropTypes.string.isRequired
}

export default ViewArchiveConfigHeader
