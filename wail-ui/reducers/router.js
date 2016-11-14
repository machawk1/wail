import Immutable from 'immutable'
import {LOCATION_CHANGE} from 'react-router-redux'

const initialState = Immutable.Map()

export default (state = initialState, action) => {
  console.log('in some reducer', action)
  return state
}
