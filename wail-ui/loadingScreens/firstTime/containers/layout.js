import React from 'react'
import PropTypes from 'prop-types'
import { namedPure } from '../../../util/recomposeHelpers'
import Header from '../../shared/header'
import { Card, CardHeader, CardMedia, CardText } from 'material-ui/Card'
import ProgressSteps from '../components/progress/progressSteps'
import ProgressMessage from '../components/progress/progressMessage'
import { firstTimeLoading } from '../../../constants/uiStrings'

const enhance = namedPure('Layout')

function Layout () {
  return [
    <Header
      key='firsttime-layout-header'
      title={firstTimeLoading.title}
    />,
    <div
      key='firsttime-layout-contentBody'
      style={{ transform: 'translateY(10px)' }}
    >
      <div className='wail-container'>
        <Card style={{ minHeight: '350px' }}>
          <CardHeader
            title={firstTimeLoading.autoConfigSteps}
          />
          <CardMedia style={{ minHeight: '300px' }}>
            <ProgressSteps/>
            <ProgressMessage/>
          </CardMedia>
        </Card>
      </div>
    </div>
  ]
}

export default enhance(Layout)
