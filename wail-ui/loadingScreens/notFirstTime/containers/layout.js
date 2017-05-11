import React from 'react'
import { namedPure } from '../../../util/recomposeHelpers'
import Header from '../../shared/header'
import { Card, CardHeader, CardMedia } from 'material-ui/Card'
import ProgressSteps from '../components/progress/progressSteps'
import ProgressMessage from '../components/progress/progressMessage'
import {notFirstTimeLoading as nftl} from '../../../constants/uiStrings'

const enhance = namedPure('Layout')

const Layout = () => (
  <div>
    <Header title={nftl.isLoading} />
    <div style={{transform: 'translateY(10px)'}}>
      <div className='wail-container'>
        <Card style={{minHeight: '350px'}}>
          <CardHeader
            title={nftl.loadingSteps}
          />
          <CardMedia style={{minHeight: '250px'}}>
            <ProgressSteps />
            <ProgressMessage />
          </CardMedia>
        </Card>
      </div>
    </div>
  </div>
)

export default enhance(Layout)
