import React, { PropTypes } from 'react'
import { namedPure } from '../../../util/recomposeHelpers'
import Header from '../../shared/header'
import { Card, CardHeader, CardMedia, CardText } from 'material-ui/Card'
import ProgressSteps from '../components/progress/progressSteps'
import ProgressMessage from '../components/progress/progressMessage'

const enhance = namedPure('Layout')

const Layout = () => (
  <div>
    <Header title='Wail Is Performing A First Time Setup' />
    <div style={{transform: 'translateY(10px)'}}>
      <div className='wail-container'>
        <Card style={{minHeight: '350px'}}>
          <CardHeader
            title='Auto Configuration Steps'
          />
          <CardMedia style={{minHeight: '300px'}}>
            <ProgressSteps />
            <ProgressMessage />
          </CardMedia>
        </Card>
      </div>
    </div>
  </div>
)

export default enhance(Layout)
