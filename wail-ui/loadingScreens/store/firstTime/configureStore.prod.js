import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { ipc, requestHandler } from '../middleware'
import rootReducer from '../../reducers/firstTime'

const configureStore = () => createStore(
  rootReducer,
  applyMiddleware(thunk, promiseMiddleware, requestHandler, ipc)
)

export default configureStore
