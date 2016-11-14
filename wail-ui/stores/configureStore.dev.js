import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import createLogger from 'redux-logger'
import {ipc, requestHandler} from '../middleware'
import rootReducer from '../reducers'
import DevTools from '../containers/devTools'
import {Map} from 'immutable'
import * as actionCreators from '../actions/redux'


const configureStore = (intialState) => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators
    }) || compose
  const store = createStore(
    rootReducer,
    intialState,
    composeEnhancers(
      applyMiddleware(thunk, ipc, promiseMiddleware, requestHandler)
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers/index').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}

export default configureStore
