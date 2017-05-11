import React from 'react'
import PropTypes from 'prop-types'
import { namedPure } from '../../../util/recomposeHelpers'
import Header from '../../shared/header'
import { Card, CardHeader, CardMedia, CardText } from 'material-ui/Card'
import ProgressSteps from '../components/progress/progressSteps'
import ProgressMessage from '../components/progress/progressMessage'
import {firstTimeLoading} from '../../../constants/uiStrings'

const enhance = namedPure('Layout')

const Layout = () => (
  <div>
    <Header title={firstTimeLoading.title} />
    <div style={{transform: 'translateY(10px)'}}>
      <div className='wail-container'>
        <Card style={{minHeight: '350px'}}>
          <CardHeader
            title={firstTimeLoading.autoConfigSteps}
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
