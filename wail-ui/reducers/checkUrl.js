import Immutable, {Map, List} from 'immutable'
import {CheckUrlEvents} from '../constants/wail-constants'
const {
  CHECKING_URL,
  CHECKING_DONE,
  CHECKING_DONE_ERROR,
  RESET_CHECK_MESSAGE
} = CheckUrlEvents

export default (state = Map({ message: '', checkingDone: false, result: {} }), action) => {
  console.log('checkUrl Reducer', action)
  switch (action.type) {
    case CHECKING_URL:
      return state.withMutations(map => map.set('checkingDone', false).set('message', action.message))
    case CHECKING_DONE:
      return state.withMutations(map =>
        map.set('message', '').set('checkingDone', true).set('result', action.result)
      )
    case RESET_CHECK_MESSAGE:
      return state.withMutations(map => map.set('message', '').set('checkingDone', false).set('result', {}))
    default:
      return state
  }
}
