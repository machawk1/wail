import React from 'react'
import PropTypes from 'prop-types'
import CardTitle from 'material-ui/Card/CardTitle'
import {Link} from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton'
import Flexbox from 'flexbox-react'
import { resetCheckMessage } from '../../../../actions/archival'
import { connect } from 'react-redux'

const dispatchToProp = dispatch => ({
  nukeCheckUrl () {
    dispatch(resetCheckMessage())
  }
})

const CollAddSeedHeader = ({col, nukeCheckUrl}, context) => {
  let {primary1Color} = context.muiTheme.baseTheme.palette
  let linkStyle = {
    color: primary1Color,
    textDecoration: 'none'
  }
  let title = <span><Link onClick={nukeCheckUrl} style={linkStyle} to='/'>Collections</Link> > <Link
    style={linkStyle}
    onClick={nukeCheckUrl}
    to={`/Collections/${col}`}>{col}</Link> > Add Seed</span>
  return (
    <Flexbox
      flexDirection='row'
      flexWrap='wrap'
      alignItems='center'
      justifyContent='space-between'
    >
      <CardTitle
        title={title}
      />
      <Link id='addFromFs' to={`/Collections/${col}/addSeed/fs`}><FlatButton primary label='From Filesystem' /></Link>
    </Flexbox>
  )
}
CollAddSeedHeader.propTypes = {
  col: PropTypes.string.isRequired
}
CollAddSeedHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default connect(null, dispatchToProp)(CollAddSeedHeader)
