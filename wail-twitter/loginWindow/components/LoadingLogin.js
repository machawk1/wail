import React from 'react'
import pure from 'recompose/pure'
import CircularProgress from 'material-ui/CircularProgress'

function LoadingLogin () {
  return (
    <div className='inheritThyWidthHeight windowCentered'>
      <CircularProgress />
    </div>
  )
}

export default pure(LoadingLogin)
