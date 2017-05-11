import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
  SelectCollectionButtons
} from '../locationButtons'
import { general } from '../../../constants/uiStrings'

export default class WailAppBar extends Component {
  static propTypes = {
    leftIconTouchTap: PropTypes.func.isRequired,
    CrawlIndicator: PropTypes.element.isRequired
  }

  constructor (...args) {
    super(...args)
    this.renderSelectCollections = this.renderSelectCollections.bind(this)
    this.renderViewCollection = this.renderViewCollection.bind(this)
    this.renderAddSeedLiveWeb = this.renderAddSeedLiveWeb.bind(this)
    this.renderAddSeedFs = this.renderAddSeedFs.bind(this)
    this.renderViewArchiveConfig = this.renderViewArchiveConfig.bind(this)
    this.renderHeritrix = this.renderHeritrix.bind(this)
    this.renderMisc = this.renderMisc.bind(this)
    this.renderServices = this.renderServices.bind(this)
    this.renderTwitter = this.renderTwitter.bind(this)
    this.renderTwitterSignIn = this.renderTwitterSignIn.bind(this)
  }

  renderSelectCollections (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.collections} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={<SelectCollectionButtons CrawlIndicator={this.props.CrawlIndicator}/>}
      />
    )
  }

  renderViewCollection (props) {
    return (
      <DynamicAppBar
        Location={<CollectionViewLocation {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={this.props.CrawlIndicator}/>}
      />
    )
  }

  renderAddSeedLiveWeb (props) {
    return (
      <DynamicAppBar
        Location={<AddSeedLocation {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={this.props.CrawlIndicator}/>}
      />
    )
  }

  renderAddSeedFs (props) {
    return (
      <DynamicAppBar
        Location={<AddFromFsLocation {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={<AddSeedButtons {...props} CrawlIndicator={this.props.CrawlIndicator}/>}
      />
    )
  }

  renderViewArchiveConfig (props) {
    return (
      <DynamicAppBar
        Location={<ViewArchiveConfigHeader {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  renderHeritrix (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.crawls} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  renderMisc (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.eventLog} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  renderServices (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.serviceStatuses} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  renderTwitter (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.archiveTwitter} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  renderTwitterSignIn (props) {
    return (
      <DynamicAppBar
        Location={<StaticLocation theLocation={general.twitterSignin} {...props} />}
        leftIconTouchTap={this.props.leftIconTouchTap}
        IconRight={this.props.CrawlIndicator}
      />
    )
  }

  render () {
    return (
      <Switch>
        <Route exact path={routeNames.selectCol} render={this.renderSelectCollections}/>
        <Route path={routeNames.viewCollection} render={this.renderViewCollection}/>
        <Route path={routeNames.addSeed} render={this.renderAddSeedLiveWeb}/>
        <Route path={routeNames.addSeedFs} render={this.renderAddSeedFs}/>
        <Route path={routeNames.viewArchiveConfig} render={this.renderViewArchiveConfig}/>
        <Route path={routeNames.heritrix} render={this.renderHeritrix}/>
        <Route path={routeNames.misc} render={this.renderMisc}/>
        <Route path={routeNames.services} render={this.renderServices}/>
        <Route path={routeNames.twitter} render={this.renderTwitter}/>
        <Route path={routeNames.twitterSignIn} render={this.renderTwitterSignIn}/>
      </Switch>
    )
  }
}

