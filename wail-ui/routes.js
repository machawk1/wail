import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/layout/layout'
import BasicTab from './components/basic/basic-tab'
import General from './components/advanced/general'
import Wayback from './components/advanced/wayback'
import Heritrix from './components/advanced/heritrix/heritrix-tab'
import Misc from './components/advanced/miscellaneous'

const Routes = (
  <Route path='/' component={Layout}>
    <IndexRoute component={BasicTab}/>
    <Route path='services' name='services' component={General}/>
    <Route path='wayback' name='wayback' component={Wayback}/>
    <Route path='heritrix' name='heritrix' component={Heritrix}/>
    <Route path='misc' name='misc' component={Misc}/>
  </Route>
)

export default Routes
