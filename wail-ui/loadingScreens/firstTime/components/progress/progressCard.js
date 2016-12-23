import React from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { Card, CardHeader, CardMedia } from 'material-ui/Card'
import ProgressSteps from './progressSteps'

const enhance = namedPure('ProgressStepsCard')

const ProgressCard = () => (
  <div className='wail-container'>
    <CardHeader
      title='Auto Configuration Steps'
    />
    <CardMedia>
      <ProgressSteps />
    </CardMedia>
  </div>
)

export default enhance(ProgressStepsCard)
