import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createEpicMiddleware } from 'redux-observable'
import Immutable from 'immutable'
import webviewMiddleware from '../middleware/webview'
import ipc from '../middleware/ipc'
import loginEpic from '../epics/webviewEpic'
import rootReducer from '../reducers'
import * as actionCreators from '../actions'

const epicMiddleware = createEpicMiddleware(loginEpic)

export default function configureStore () {
  let composeEnhancers
  if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators
    })
  } else {
    composeEnhancers = compose
  }
  const store = createStore(
    rootReducer,
    Immutable.Map(),
    composeEnhancers(applyMiddleware(thunk, ipc, epicMiddleware, webviewMiddleware))
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'))
    })
  }

  return store
}
