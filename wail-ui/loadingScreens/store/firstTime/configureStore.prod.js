import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createEpicMiddleware } from 'redux-observable'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../../reducers/firstTime'
import rootEpic from '../../epics'

const epicMiddleware = createEpicMiddleware(rootEpic)

const configureStore = () => createStore(rootReducer,
  applyMiddleware(epicMiddleware,thunk, promiseMiddleware)
)

export default configureStore
