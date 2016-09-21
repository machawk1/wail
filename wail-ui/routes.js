import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/layout/layout'
import BasicTab from './components/basic/basic-tab'
import General from './components/advanced/general'
import Wayback from './components/wayback/wayback'
import CollectionView from './components/wayback/collectionView/collectionView2'
import Heritrix from './components/heritrix/heritrix-tab'
import Misc from './components/advanced/miscellaneous'
import Test from './components/test/test'
/*
 <IndexRoute component={BasicTab}/>
 <Route path='services' name='services' component={General}/>
 <Route path='wayback' name='wayback' component={Wayback}>
 <Route path=':col' component={CollectionView}/>
 </Route>
 <Route path='heritrix' name='heritrix' component={Heritrix}/>
 <Route path='misc' name='misc' component={Misc}/>
 */
const Routes = (
  <Route path='/' component={Layout}>
    <IndexRoute component={Test}/>
  </Route>
)

export default Routes
