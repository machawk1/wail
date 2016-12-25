import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../../reducers/notFirstTime'
import { ipc } from '../../middleware'

const configureStore = () => createStore(rootReducer,
  applyMiddleware(thunk, promiseMiddleware, ipc)
)

export default configureStore
