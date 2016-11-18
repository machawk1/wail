import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import {ipc, requestHandler, heritrixRequestHandler} from '../middleware'
import rootReducer from '../reducers'

const configureStore = preloadedState => createStore(
  rootReducer,
  preloadedState,
  applyMiddleware(thunk, ipc, promiseMiddleware, requestHandler, heritrixRequestHandler)
)

export default configureStore
