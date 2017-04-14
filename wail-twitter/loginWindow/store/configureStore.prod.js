import { createStore, applyMiddleware, compose } from 'redux'
import { Map } from 'immutable'
import ipc from '../middleware'
import rootReducer from '../reducers'

export default function configureStore () {
  return createStore(
    rootReducer,
    Map(),
    applyMiddleware(ipc)
  )
}
