import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { ipc, requestHandler } from '../middleware'
import rootReducer from '../reducers'
import { Map } from 'immutable'
import * as actionCreators from '../actions/index'

const configureStore = () => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    actionCreators
  }) || compose
  const store = createStore(
    rootReducer,
    Map(),
    composeEnhancers(
      applyMiddleware(thunk, promiseMiddleware, requestHandler, ipc)
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'))
    })
  }

  return store
}

export default configureStore
