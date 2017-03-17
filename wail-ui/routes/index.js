import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Header from '../components/layout/header'
import HeritrixView from '../containers/heritrixView'
import SelectColContainer from '../containers/selectColContainer'
import CollectionView from '../containers/collectionView'
import CollectionAddSeed from '../containers/collectionAddSeed'
import CollectionAddSeedFs from '../containers/collectionAddSeedFs'
import ServiceStats from '../containers/serviceStats'
import Misc from '../containers/miscellaneous'
import TwitterView from '../containers/twitterView'
import SignIn from '../components/twitter/signIn'
import ViewArchiveConfig from '../containers/viewArchiveConfig'
import routeNames from './routeNames'

export default (
  <div style={{width: 'inherit', height: 'inherit'}}>
    <Header  />
    <div className='layoutBody'>
      <Switch>
        <Route exact path={routeNames.selectCol} component={SelectColContainer}/>
        <Route path={routeNames.viewCollection} component={CollectionView}/>
        <Route path={routeNames.addSeed} component={CollectionAddSeed}/>
        <Route path={routeNames.addSeedFs} component={CollectionAddSeedFs}/>
        <Route path={routeNames.viewArchiveConfig} component={ViewArchiveConfig}/>
        <Route path={routeNames.heritrix} component={HeritrixView}/>
        <Route path={routeNames.misc} component={Misc}/>
        <Route path={routeNames.services} component={ServiceStats}/>
        <Route path={routeNames.twitter} component={TwitterView}/>
        <Route path={routeNames.twitterSignIn} component={SignIn}/>
      </Switch>
    </div>
  </div>
)
