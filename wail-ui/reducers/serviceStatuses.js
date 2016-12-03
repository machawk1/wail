import {Map} from 'immutable'
import {ServiceEvents} from '../constants/wail-constants'

const { HERITRIX_STATUS_UPDATE, WAYBACK_STATUS_UPDATE, WAYBACK_RESTART } = ServiceEvents

export default (state = Map({ heritrix: true, wayback: true }), action) => {
  switch (action.type) {
    case HERITRIX_STATUS_UPDATE:
      return state.set('heritrix', action.status)
    case WAYBACK_STATUS_UPDATE:
      return state.set('wayback', action.status)
    case WAYBACK_RESTART:
      return state.set('wayback', false)
    default:
      return state
  }
}