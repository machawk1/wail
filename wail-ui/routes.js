import React from 'react'
import {Router, hashHistory, Route, IndexRoute} from 'react-router'
import Layout from './components/layout/layout'
import BasicTab from './components/basic'
import General from './components/advanced/general'
import Wayback from './components/wayback/wayback'
// import CollectionView from './components/wayback/collectionView/collectionView'
import Heritrix from './components/heritrix/heritrix-tab'
import HeritrixView from './components/heritrix/heritrixView'
import Misc from './components/advanced/miscellaneous'
import hi from './components/combined/hi'
import Combined from './components/combined/combined'
import CollectionView from './components/combined/collectionView'
import CollectionAddSeed from './components/combined/collAddSeed'
// const Routes = (
//   <Route path='/' component={Layout}>
//     <IndexRoute component={Test}/>
//   </Route>
// )
// (
//   <Router history={hashHistory}>
//     <Route path='/' component={Layout}>
//       <IndexRoute component={BasicTab} name='Wail'/>
//       <Route path='services' name='Services' component={General}/>
//       <Route path='wayback' name='Wayback' component={Wayback}/>
//       <Route path='wayback/:col' name=':col' component={CollectionView}/>
//       <Route path='heritrix' name='Heritrix' component={Heritrix}/>
//       <Route component={combined}>
//         <Route path='misc' name='Misc' component={hi}/>
//       </Route>
//     </Route>
//   </Router>
// )
export default <Route path='/' component={Layout}>
  <IndexRoute component={Combined} />
  <Route path='Collections/:col' component={CollectionView} />
  <Route path='Collections/:col/addSeed' component={CollectionAddSeed} />
  <Route path='heritrix' name='Heritrix' component={HeritrixView} />
</Route>
