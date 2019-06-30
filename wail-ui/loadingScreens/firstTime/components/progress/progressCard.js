import React from 'react'
import { namedPure } from '../../../../util/recomposeHelpers'
import { Card, CardHeader, CardMedia } from 'material-ui/Card'
import ProgressSteps from './progressSteps'
import {firstTimeLoading as ftl} from '../../../../constants/uiStrings'

const enhance = namedPure('ProgressStepsCard')

const ProgressCard = () => (
  <div className='wail-container'>
    <CardHeader
      title={ftl.autoConfigSteps}
    />
    <CardMedia>
      <ProgressSteps />
    </CardMedia>
  </div>
)

export default enhance(ProgressCard)
