import { OsCheckRecord } from '../../records'
import { CHECKED_OS } from '../../constants'

export default (state = new OsCheckRecord(), action) => {
  if (action.type === CHECKED_OS) {
    return state.updateFromAction(action)
  } else {
    return state
  }
}