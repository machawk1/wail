import React from 'react'
import {Route, IndexRoute} from 'react-router'
import Layout from './components/layout/layout'
import HeritrixView from './containers/heritrixView'
import SelectColContainer from './containers/selectColContainer'
import CollectionView from './containers/collectionView'
import CollectionAddSeed from './containers/collectionAddSeed'
import CollectionAddSeedFs from './containers/collectionAddSeedFs'
import General from './components/advanced/general'
import Misc from './components/advanced/miscellaneous'
import TwitterView from './containers/twitterView'
import SignIn from './components/twitter/signIn'

export default (
  <Route path='/' component={Layout}>
    <IndexRoute component={SelectColContainer}/>
    <Route path='Collections/:col' component={CollectionView}/>
    <Route path='Collections/:col/addSeed' component={CollectionAddSeed}/>
    <Route path='Collections/:col/addSeed/fs' component={CollectionAddSeedFs}/>
    <Route path='heritrix' component={HeritrixView}/>
    <Route path='misc' component={Misc}/>
    <Route path='services' component={General}/>
    <Route path='twitter' component={TwitterView}/>
    <Route path='twitter-signin' component={SignIn}/>
  </Route>
)
