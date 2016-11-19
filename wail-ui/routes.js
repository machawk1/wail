import React from 'react'
import {Route, IndexRoute} from 'react-router'
import Layout from './components/layout/layout'
import HeritrixView from './containers/heritrixView'
import Combined from './components/combined/combined'
import SelectColContainer from './containers/selectColContainer'
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
  <IndexRoute component={SelectColContainer} />
  <Route path='Collections/:col' component={CollectionView} />
  <Route path='Collections/:col/addSeed' component={CollectionAddSeed} />
  <Route path='heritrix' name='Heritrix' component={HeritrixView} />
</Route>
