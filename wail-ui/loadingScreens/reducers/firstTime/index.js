import { combineReducers } from 'redux-immutable'
import { enableBatching } from 'redux-batched-actions'
import { filterActions } from 'redux-ignore'
import { CHECKED_OS, CHECKED_JAVA, NEXT_LOADING_STEP, PREV_LOADING_STEP } from '../../constants'
import loadingStep from './loadingStep'
import osCheck from './osCheck'
import javaCheck from './javaCheck'

const rootReducer = enableBatching(combineReducers({
  loadingStep: filterActions(loadingStep, [NEXT_LOADING_STEP, PREV_LOADING_STEP]),
  osCheck: filterActions(osCheck, (action) => action.type === CHECKED_OS),
  javaCheck: filterActions(javaCheck, (action) => action.type === CHECKED_JAVA),
}))

export default rootReducer