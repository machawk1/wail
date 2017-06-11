import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { createEpicMiddleware } from 'redux-observable'
import Immutable from 'immutable'
import webviewMiddleware from '../middleware/webview'
import ipc from '../middleware/ipc'
import loginEpic from '../epics/webviewEpic'
import rootReducer from '../reducers'

const epicMiddleware = createEpicMiddleware(loginEpic)

export default function configureStore () {
  return createStore(
    rootReducer,
    Immutable.Map(),
    applyMiddleware(thunk, ipc, epicMiddleware, webviewMiddleware)
  )
}
