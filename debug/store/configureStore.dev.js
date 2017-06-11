import { createStore, applyMiddleware, compose } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import Immutable from 'immutable'
import webviewMiddleware from '../middleware/webview'
import ipc from '../middleware/ipc'
import loginEpic from '../epics/webviewEpic'
import rootReducer from '../reducers'
import * as actionCreators from '../actions'

const epicMiddleware = createEpicMiddleware(loginEpic)

export default function configureStore () {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators
    }) || compose
  const store = createStore(
    rootReducer,
    Immutable.Map(),
    composeEnhancers(applyMiddleware(ipc, epicMiddleware, webviewMiddleware))
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'))
    })
  }

  return store
}
