import Immutable from 'immutable'
import {Header} from '../constants/wail-constants'

const { HEADER_OPEN_CLOSE, HEADER_LOCATION, HEADER_TOGGLE } = Header

export default (state = Immutable.Map({ location: 'WAIL', open: false }), action) => {
  switch (action.type) {
    case HEADER_LOCATION:
      return state.withMutations(map => map.set('location', action.location).set('open', false))
    case HEADER_OPEN_CLOSE:
      return state.set('open', action.open)
    case HEADER_TOGGLE:
      return state.set('open', !state.get('open'))
    default:
      return state
  }
}
