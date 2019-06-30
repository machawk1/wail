import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../../reducers/firstTime'
import { epic, ipc } from '../../middleware'

const configureStore = () => createStore(rootReducer,
  applyMiddleware(thunk, promiseMiddleware, epic, ipc)
)

export default configureStore
