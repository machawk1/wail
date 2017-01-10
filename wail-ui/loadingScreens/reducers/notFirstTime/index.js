import { combineReducers } from 'redux-immutable'
import { filterActions } from 'redux-ignore'
import { STEP, SERVICES, INITIAL_LOAD } from '../../constants'
import loadingStep from '../shared/loadingStep'
import services from '../shared/services'
import uiState from '../shared/uiState'

const rootReducer = combineReducers({
  loadingStep: filterActions(loadingStep, Object.values(STEP)),
  services: filterActions(services, Object.values(SERVICES)),
  uiState: filterActions(uiState, Object.values(INITIAL_LOAD))
})

export default rootReducer
