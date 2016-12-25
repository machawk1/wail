import { combineReducers } from 'redux-immutable'
import { enableBatching } from 'redux-batched-actions'
import { filterActions } from 'redux-ignore'
import { OS_CHECK, JAVA_CHECK, JDK_DOWNLOAD, STEP, JDK_INSTALL, SERVICES, INITIAL_LOAD } from '../../constants'
import loadingStep from './loadingStep'
import osCheck from './osCheck'
import javaCheck from './javaCheck'
import jdkDl from './jdkDl'
import jdkInstall from './jdkInstall'
import services from './services'
import uiState from './uiState'

const rootReducer = enableBatching(combineReducers({
  loadingStep: filterActions(loadingStep, Object.values(STEP)),
  osCheck: filterActions(osCheck, (action) => action.type === OS_CHECK.CHECKED_OS),
  javaCheck: filterActions(javaCheck, (action) => action.type === JAVA_CHECK.CHECKED_JAVA),
  jdkDl: filterActions(jdkDl, Object.values(JDK_DOWNLOAD)),
  jdkInstall: filterActions(jdkInstall, Object.values(JDK_INSTALL)),
  services: filterActions(services, Object.values(SERVICES)),
  uiState: filterActions(uiState, Object.values(INITIAL_LOAD)),
}))

export default rootReducer
