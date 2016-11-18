import React, {PropTypes} from 'react'
import {Provider} from 'react-redux'
import routes from '../routes'
import DevTools from './devTools'
import {Router, hashHistory} from 'react-router'
import {
  syncHistoryWithStore
} from 'react-router-redux'

const Root = ({ store }) => {
  console.log('in Root dev')
  return (
    <Provider store={store}>
      <Router history={hashHistory} routes={routes} />
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
