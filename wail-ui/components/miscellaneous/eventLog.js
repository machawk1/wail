import React from 'react'
import { namedPure } from '../../util/recomposeHelpers'
import LogViewer from './logViewer'
import MyAutoSizer from '../utilComponents/myAutoSizer'

const enhance = namedPure('EventLog')

const EventLog = enhance(() => (
  <MyAutoSizer findElement='eventLogContainer'>
    {({height}) => (
      <LogViewer height={height}/>
    )}
  </MyAutoSizer>
))

export default EventLog
