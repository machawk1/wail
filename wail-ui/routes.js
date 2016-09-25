import React from 'react'
import { Route, IndexRoute,Redirect } from 'react-router'
import Layout from './components/layout/layout'
import BasicTab from './components/basic/basic-tab'
import General from './components/advanced/general'
import Wayback from './components/wayback/wayback'
import CollectionView from './components/wayback/collectionView/collectionView'
import Heritrix from './components/heritrix/heritrix-tab'
import Misc from './components/advanced/miscellaneous'
import Test from './components/test/test'


/*
 <Route path='/' component={Layout}>
 <IndexRoute component={Test}/>
 </Route>
 */
console.log(window.lastWaybackPath)
const Routes = (
  <Route path='/' component={Layout}>
    <IndexRoute component={BasicTab}/>
    <Route path='services' name='services' component={General}/>
    <Redirect from='wayback' to={`wayback/${window.lastWaybackPath}`}/>
    <Route path='wayback/:col' name='wayback' component={Wayback}/>
    <Route path='heritrix' name='heritrix' component={Heritrix}/>
    <Route path='misc' name='misc' component={Misc}/>
  </Route>
)

// const Routes = (
//   <Route path='/' component={Layout}>
//     <IndexRoute component={Test}/>
//   </Route>
// )

export default Routes
