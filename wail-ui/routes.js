import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './componets/layout/layout'
import BasicTab from './componets/basic/basic-tab'
import General from './componets/advanced/general'
import Wayback from './componets/advanced/wayback'
import Heritrix from './componets/advanced/heritrix/heritrix-tab'
import Misc from './componets/advanced/miscellaneous'

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
