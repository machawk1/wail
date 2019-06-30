import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { Map } from 'immutable'
import { ipc, requestHandler } from '../middleware'
import rootReducer from '../reducers'

const configureStore = () => createStore(
  rootReducer,
  Map(),
  applyMiddleware(thunk, promiseMiddleware, requestHandler, ipc)
)

export default configureStore
