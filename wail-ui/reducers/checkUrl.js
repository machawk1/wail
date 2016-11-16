import Immutable, {Map, List} from 'immutable'
import {CheckUrlEvents} from '../constants/wail-constants'
const {
  CHECKING_ARCHIVE,
  NOT_IN_ARCHIVE,
  IN_ARCHIVE,
  RESET_CHECK_MESSAGE,
} = CheckUrlEvents

export default (state = Map({ message: '', haveCaptures: false, captures: [] }), action) => {
  console.log('checkUrl Reducer', state.toJS(), action)
  switch (action.type) {
    case CHECKING_ARCHIVE:
      return state.withMutations(map => map.set('message', action.message).set('haveCaptures', false))
    case NOT_IN_ARCHIVE:
      console.log(action)
      return state.withMutations(map => map.set('message', action.message).set('haveCaptures', false))
    case IN_ARCHIVE:
      console.log(action.captures)
      return state.withMutations(map => map.set('captures', action.captures).set('haveCaptures', true))
    case RESET_CHECK_MESSAGE:
      return state.withMutations(map => map.set('message', '').set('captures', []).set('haveCaptures', false))
    default:
      return state
  }
}