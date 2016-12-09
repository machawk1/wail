import React from 'react'
import LogViewer from './logViewer'
import MyAutoSizer from '../utilComponents/myAutoSizer'

const EventLog = () => (
  <MyAutoSizer findElement='eventLogContainer'>
    {({ height }) => (
      <LogViewer height={height} />
    )}
  </MyAutoSizer>
)

export default EventLog
