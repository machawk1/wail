import React from 'react'
import PropTypes from 'prop-types'
import pure from 'recompose/pure'
import CircularProgress from 'material-ui/CircularProgress'


function LoadingLogin (_, {muiTheme}) {
  return (
    <div className="inheritThyWidthHeight">
      <CircularProgress />
    </div>
  )
}

LoadingLogin.contextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default pure(LoadingLogin)
