import { createStore, applyMiddleware, compose } from 'redux'
import { Map } from 'immutable'
import ipc from '../middleware'
import rootReducer from '../reducers'
import * as actionCreators from '../actions'

export default function configureStore () {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    actionCreators
  }) || compose
  const store = createStore(
    rootReducer,
    Map(),
    composeEnhancers(
      applyMiddleware(ipc)
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
