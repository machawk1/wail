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
import TwitterSignIn from '../containers/twitterSignIn'
import ViewArchiveConfig from '../containers/viewArchiveConfig'
import WailCrawls from '../containers/wailCrawls'
import routeNames from './routeNames'

function makeRenderer (Component) {
  return props => (
    <Component {...props} />
  )
}

export default (
  <div style={{width: 'inherit', height: 'inherit'}}>
    <Header />
    <div className='layoutBody'>
      <Switch>
        <Route exact path={routeNames.selectCol} render={makeRenderer(SelectColContainer)} />
        <Route path={routeNames.viewCollection} render={makeRenderer(CollectionView)} />
        <Route path={routeNames.addSeed} render={makeRenderer(CollectionAddSeed)} />
        <Route path={routeNames.addSeedFs} render={makeRenderer(CollectionAddSeedFs)} />
        <Route path={routeNames.viewArchiveConfig} render={makeRenderer(ViewArchiveConfig)} />
        <Route path={routeNames.heritrix} render={makeRenderer(HeritrixView)} />
        <Route path={routeNames.wailCrawls} render={makeRenderer(WailCrawls)} />
        <Route path={routeNames.misc} render={makeRenderer(Misc)} />
        <Route path={routeNames.services} render={makeRenderer(ServiceStats)} />
        <Route path={routeNames.twitter} render={makeRenderer(TwitterView)} />
        <Route path={routeNames.twitterSignIn} render={makeRenderer(TwitterSignIn)} />
      </Switch>
    </div>
  </div>
)
