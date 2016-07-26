import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from '../src/componets/layout/layout'
import BasicTab from '../src/componets/basic/basic-tab'
import General from '../src/componets/advanced/general'
import Wayback from '../src/componets/advanced/wayback'
import Heritrix from '../src/componets/advanced/heritrix/heritrix-tab'
import Misc from '../src/componets/advanced/miscellaneous'

const Routes = (
  <Route path='/' component={Layout}>
    <IndexRoute component={BasicTab} />
    <Route path='services' name='services' component={General} />
    <Route path='wayback' name='wayback' component={Wayback} />
    <Route path='heritrix' name='heritrix' component={Heritrix} />
    <Route path='misc' name='misc' component={Misc} />
  </Route>
)

export default Routes
