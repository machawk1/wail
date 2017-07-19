import React from 'react'
import { namedPure } from '../util/recomposeHelpers'
import WailCrawls from '../components/wailCrawls'

const enhance = namedPure('WailCrawlView')

function WailCrawlView () {
  return (
    <div className='widthHeightHundoPercent' id='wViewContainer'>
      <WailCrawls />
    </div>
  )
}


export default enhance(WailCrawlView)