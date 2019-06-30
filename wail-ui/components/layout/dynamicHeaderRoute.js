import React from 'react'
import { Route, Switch } from 'react-router-dom'
import DynamicHeader from './dynamicHeader'

const DynamicHeaderRoute = () => (
  <Switch>
    <Route exact path='/' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/collections/:col' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/addSeed/:col' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/addFsSeed/:col' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/viewArchiveConfig/:col' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/heritrix' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/misc' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/services' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/twitter' render={props => (
      <DynamicHeader {...props} />
    )} />
    <Route path='/twitter-signin' render={props => (
      <DynamicHeader {...props} />
    )} />
  </Switch>
)

export default DynamicHeaderRoute
