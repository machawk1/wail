import React, { PropTypes } from 'react'
import { Route, Switch } from 'react-router-dom'
import routeNames from '../../../routes/routeNames'
import DynamicAppBar from './dynamicAppBar'
import {
  AddSeedLocation,
  AddFromFsLocation,
  CollectionViewLocation,
  StaticLocation,
  ViewArchiveConfigHeader
} from '../location'
import {
  AddSeedButtons,
  SelectCollectionButtons,
} from '../locationButtons'

const WailAppBar = ({leftIconTouchTap, CrawlIndicator}) => (
  <Switch>
    <Route exact path={routeNames.selectCol} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Collections' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={<SelectCollectionButtons CrawlIndicator={CrawlIndicator}/>}
      />
    )}/>
    <Route path={routeNames.viewCollection} render={props => (
      <DynamicAppBar
        Location={<CollectionViewLocation {...props} />}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={CrawlIndicator}/>}
      />
    )}/>
    <Route path={routeNames.addSeed} render={props => (
      <DynamicAppBar
        Location={<AddSeedLocation {...props} />}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={CrawlIndicator}/>}
      />
    )}/>
    <Route path={routeNames.addSeedFs} render={props => (
      <DynamicAppBar
        Location={<AddFromFsLocation {...props} />}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={CrawlIndicator}/>}
      />
    )}/>
    <Route path={routeNames.viewArchiveConfig} render={props => (
      <DynamicAppBar
        Location={<ViewArchiveConfigHeader {...props} />}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
    <Route path={routeNames.heritrix} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Crawls' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
    <Route path={routeNames.misc} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Event Log' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
    <Route path={routeNames.services} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Service Status' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
    <Route path={routeNames.twitter} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Archive Twitter' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
    <Route path={routeNames.twitterSignIn} render={props => (
      <DynamicAppBar
        Location={<StaticLocation theLocation='Twitter Sign In' {...props}/>}
        leftIconTouchTap={leftIconTouchTap}
        IconRight={CrawlIndicator}
      />
    )}/>
  </Switch>
)

WailAppBar.propTypes = {
  leftIconTouchTap: PropTypes.func.isRequired,
  CrawlIndicator: PropTypes.element.isRequired
}

export default WailAppBar
