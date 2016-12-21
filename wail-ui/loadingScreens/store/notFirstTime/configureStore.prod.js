import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { ipc, requestHandler } from '../middleware'
import rootReducer from '../../reducers/notFirstTime'

const configureStore = () => createStore(
  rootReducer,
  applyMiddleware(thunk, promiseMiddleware, requestHandler, ipc)
)

export default configureStore
