import React from 'react'
import { namedPure } from '../util/recomposeHelpers'
import HeritrixToolBar from '../components/heritrix/heritrixToolBar'
import Heritrix2 from '../components/heritrix'

const enhance = namedPure('HeritrixView')

const HeritrixView = enhance(() => (
  <div style={{width: '100%', height: '100%'}} id='hViewContainer'>
    <Heritrix2 />
    <HeritrixToolBar />
  </div>
))

export default HeritrixView
