import {hashHistory} from 'react-router'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import createLogger from 'redux-logger'
import {routerMiddleware} from 'react-router-redux'
import {ipc, requestHandler} from '../middleware'
import rootReducer from '../reducers'
import * as actionCreators from '../actions/redux/index'

// const logger = createLogger()
const configureStore = () => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators
    }) || compose
  const store = createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(thunk, promiseMiddleware, routerMiddleware(hashHistory), requestHandler, ipc)
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
