import React, {Component, PropTypes} from 'react'
import CardTitle from 'material-ui/Card/CardTitle'
import {Link, IndexLink} from 'react-router'
import {connect} from 'react-redux'
import {batchActions} from 'redux-batched-actions'
import {resetCheckMessage} from '../../../../actions/redux/archival'
import {resetAddFSSeedMessage} from '../../../../actions/redux/addSeedFromFs'

const dispatchToProp = dispatch => ({
  nukeCheckUrl () {
    dispatch(batchActions([ resetCheckMessage(), resetAddFSSeedMessage() ]))
  },
  nukeAddFsSeed () {
    dispatch(resetAddFSSeedMessage())
  }
})

const AddFromFSHeader = ({ col, nukeCheckUrl, nukeAddFsSeed }, context) => {
  let { primary1Color } = context.muiTheme.baseTheme.palette
  let linkStyle = {
    color: primary1Color,
    textDecoration: 'none'
  }
  let colsLink = <IndexLink onClick={nukeCheckUrl} style={linkStyle} to='/'>Collections</IndexLink>
  let colLink = <Link style={linkStyle} onClick={nukeCheckUrl} to={`Collections/${col}`}>{col}</Link>
  let addSLink = <Link style={linkStyle} onClick={nukeAddFsSeed} to={`/Collections/${col}/addSeed`}>Add Seed</Link>
  let title = <span>{colsLink} > {colLink} > {addSLink} > From Filesystem</span>

  return (
    <CardTitle title={title}
      subtitle={'Drag and Drop (W)arcs here to add them to this collection'}
    />
  )
}

AddFromFSHeader.propTypes = {
  col: PropTypes.string.isRequired
}
AddFromFSHeader.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default connect(null, dispatchToProp)(AddFromFSHeader)
