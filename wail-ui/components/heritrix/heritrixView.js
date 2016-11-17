import React, {Component, PropTypes} from 'react'
import HeritrixToolBar from './heritrixToolBar'
import Heritrix2 from './heritrix2'

const HeritrixView = () => (
  <div style={{ width: '100%', height: '100%' }} id='hViewContainer'>
    <Heritrix2 />
    <HeritrixToolBar />
  </div>
)

export default HeritrixView