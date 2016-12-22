import { JavaCheckRecord } from '../../records'
import { CHECKED_JAVA } from '../../constants'

export default (state = new JavaCheckRecord(), action) => {
  if (action.type === CHECKED_JAVA) {
    return state.updateFromAction(action)
  } else {
    return state
  }
}