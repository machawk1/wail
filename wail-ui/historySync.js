import { syncHistoryWithStore } from 'react-router-redux'
import { is } from 'immutable'

const createSelectLocationState = () => {
  let prevRoutingState, prevRoutingStateJS
  return (state) => {
    const routingState = state.get('routing')
    if (!is(prevRoutingState, routingState)) {
      prevRoutingState = routingState
      prevRoutingStateJS = routingState.toJS()
    }
    return prevRoutingStateJS
  }
}

const makeSyncedHistory = (hashHistory, store) =>
  syncHistoryWithStore(hashHistory, store, {
    selectLocationState: createSelectLocationState()
  })

export default makeSyncedHistory
