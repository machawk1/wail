import * as actions from './actions'

const setupTestHook = (store) => {
  window.___store = store
  window.___getCurrentState = () => store.getState().toJS()
  window.___executeAction1 = (actionCreator, action, arg) => {
    store.dispatch(actions[action](arg))
  }
  window.___getStateFor = who => store.getState().get(who).toJS()
  window.___getStateForProp = (who, prop) => store.getState().get(who).get(prop).toJS()
  window.___actions = actions
}

export default setupTestHook
