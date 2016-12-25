import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../../reducers/firstTime'
import * as actionCreators from '../../actions'
import { epic, ipc } from '../../middleware'

const configureStore = () => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      actionCreators
    }) || compose
  const store = createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(thunk, promiseMiddleware, epic, ipc)
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../../reducers/firstTime', () => {
      store.replaceReducer(require('../../reducers/firstTime/index'))
    })
  }

  return store
}

export default configureStore
