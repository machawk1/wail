import React from 'react'
import { grey400 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import pure from 'recompose/pure'


const HeritrixActionIcon = ({jobId}) => (
  <IconButton
    key={`HJIR-${jobId}-actionButton`}
    touch
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
)


export default pure(HeritrixActionIcon)
