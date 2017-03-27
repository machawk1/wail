import Immutable from 'immutable'
import {
  LOCATION_CHANGE
} from 'react-router-redux'

const initialState = Immutable.fromJS({
  locationBeforeTransitions: null
})

export default (state = initialState, action) => {
  if (action.type === LOCATION_CHANGE) {
    let loc = action.payload.pathname
    if (action.payload.pathname !== '/') {
      if (loc[0] === '/') { loc = loc.substr(1) }
    }
    return state.merge({
      locationBeforeTransitions: action.payload,
      loc
    })
  }

  return state
}
