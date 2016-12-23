import React from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { Card, CardHeader, CardMedia } from 'material-ui/Card'
import ProgressMessage from './progressMessage'

const enhance = namedPure('ProgressMessageCard')

const ProgressMessageCard = () => (
  <div className='wail-container'>
    <CardHeader
      title='Whats Happening'
    />
    <CardMedia>
      <ProgressMessage />
    </CardMedia>
  </div>
)

export default enhance(ProgressMessageCard)
