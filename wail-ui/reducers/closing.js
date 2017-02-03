import Immutable from 'immutable'
import { Closing } from '../constants/wail-constants'

const {CLOSING, CLOSING_MESSAGE} = Closing

const closing = (state = Immutable.Map({isClosing: false, messages: []}), action) => {
  switch (action.type) {
    case CLOSING:
      return state.set('isClosing', true)
    case CLOSING_MESSAGE:
      return state.set('messages', state.get('messages').push(action.message))
    default:
      return state
  }
}

export default closing
