import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'
import routes from '../routes'
import {Router, hashHistory} from 'react-router'
import {
  syncHistoryWithStore
} from 'react-router-redux'

const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <Router history={hashHistory} routes={routes} />
    </Provider>
  )
}
Root.propTypes = {
  store: PropTypes.object.isRequired
}
