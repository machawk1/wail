import React from 'react'
import {Route, IndexRoute} from 'react-router'
import Layout from './components/layout/layout'
import HeritrixView from './containers/heritrixView'
import SelectColContainer from './containers/selectColContainer'
import CollectionView from './containers/collectionView'
import CollectionAddSeed from './components/combined/collAddSeed'
import General from './components/advanced/general'
import Misc from './components/advanced/miscellaneous'

export default <Route path='/' component={Layout}>
  <IndexRoute component={SelectColContainer} />
  <Route path='Collections/:col' component={CollectionView} />
  <Route path='Collections/:col/addSeed' component={CollectionAddSeed} />
  <Route path='heritrix' name='Heritrix' component={HeritrixView} />
  <Route path='misc' name='Misc' component={Misc}/>
  <Route path='services' name='Services' component={General}/>
</Route>
