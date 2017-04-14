import { combineReducers } from 'redux-immutable'
import { Map } from 'immutable'

const rootReducer = combineReducers({
  overlay (state = Map({open: false}), action) {
    switch (action.type) {
      case 'toggle':
        return state.set('open', !state.get('open'))
      default:
        return state
    }
  }
})

export default rootReducer
