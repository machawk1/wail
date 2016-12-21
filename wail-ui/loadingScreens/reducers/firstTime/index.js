import { combineReducers } from 'redux-immutable'
import { enableBatching } from 'redux-batched-actions'
import loadingStep from './loadingStep'
import osCheck from './osCheck'

const rootReducer = enableBatching(combineReducers({
  loadingStep,
  osCheck
}))

export default rootReducer