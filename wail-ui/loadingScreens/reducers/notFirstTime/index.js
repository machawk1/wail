import { combineReducers } from 'redux-immutable'
import { enableBatching } from 'redux-batched-actions'
import loadingStep from './loadingStep'

const rootReducer = enableBatching(combineReducers({
  loadingStep
}))

export default rootReducer