import React from 'react'
import { namedPure } from '../util/recomposeHelpers'
import HeritrixToolBar from '../components/heritrix/heritrixToolBar'
import Heritrix2 from '../components/heritrix'

const enhance = namedPure('HeritrixView')

const HeritrixView = enhance(() => (
  <div className='widthHeightHundoPercent' id='hViewContainer'>
    <Heritrix2 />
    <HeritrixToolBar />
  </div>
))

export default HeritrixView
