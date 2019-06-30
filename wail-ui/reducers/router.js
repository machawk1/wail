import Immutable from 'immutable'
import {LOCATION_CHANGE, CALL_HISTORY_METHOD} from 'react-router-redux'

const initialState = Immutable.fromJS({
  locationBeforeTransitions: ''
})

export default (state = initialState, { type, payload }) => {
  if (type === LOCATION_CHANGE) {
    console.log(LOCATION_CHANGE, payload)
    return state.merge({ locationBeforeTransitions: payload })
  } else {
    console.log(type, payload)
  }
  return state
}
