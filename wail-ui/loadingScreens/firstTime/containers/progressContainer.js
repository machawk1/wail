import React from 'react'
import pure from 'recompose/pure'
import { ProgressSteps } from '../components/progress'

const ProgressContainer = () => (
  <div style={{width: 'inherit', height: 'inherit'}}>
    <ProgressSteps />
  </div>
)

export default pure(ProgressContainer)