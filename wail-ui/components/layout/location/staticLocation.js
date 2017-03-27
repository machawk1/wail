import React, { PropTypes } from 'react'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'

const StaticLocation = ({theLocation}, {muiTheme: {appBar}}) => (
  <h1
    id='staticloc'
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

export default onlyUpdateForKeys(['theLocation'])(StaticLocation)
