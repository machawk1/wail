import React, { PropTypes } from 'react'
import pure from 'recompose/pure'

const StaticLocation = ({theLocation}, {muiTheme:{appBar}}) => (
  <h1
    style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
      letterSpacing: 0,
      fontSize: 24,
      fontWeight: appBar.titleFontWeight,
      color: appBar.textColor,
      height: 55,
      lineHeight: '55px'
    }}
  >{theLocation}</h1>
)

StaticLocation.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

StaticLocation.propTypes = {
  theLocation: PropTypes.string.isRequired
}

export default pure(StaticLocation)
