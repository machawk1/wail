import {hashHistory} from 'react-router'
import {createStore, applyMiddleware, compose} from 'redux'
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import {ipc, requestHandler} from '../middleware'
import rootReducer from '../reducers'

const configureStore = () => createStore(
  rootReducer,
  applyMiddleware(thunk, promiseMiddleware, routerMiddleware(hashHistory), requestHandler, ipc)
)

export default configureStore
