import React, {Component} from 'react'
import {Card, CardHeader, CardMedia} from 'material-ui/Card'
import EventLog from '../components/miscellaneous/eventLog'
import MiscToolBar from '../components/miscellaneous/miscToolBar'

const Misc = () => (
  <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
    <div style={{ height: 'inherit', margin: 'auto', padding: '25px' }} id='eventLogContainer'>
      <Card>
        <CardHeader
          title='Event Log'
          subtitle='Last 100 Events'
        />
        <CardMedia>
          <EventLog />
        </CardMedia>
        <MiscToolBar />
      </Card>
    </div>
  </div>
)

export default Misc
