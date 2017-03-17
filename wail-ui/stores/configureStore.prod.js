import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { Map } from 'immutable'
import { ipc, requestHandler } from '../middleware'
import rootReducer from '../reducers'

const configureStore = (history) => createStore(
  rootReducer,
  Map(),
  applyMiddleware(thunk, promiseMiddleware, routerMiddleware(history), requestHandler(history), ipc)
)

export default configureStore
