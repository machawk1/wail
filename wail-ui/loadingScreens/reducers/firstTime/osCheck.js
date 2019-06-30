import { OsCheckRecord } from '../../records'
import { OS_CHECK } from '../../constants'

const {CHECKED_OS} = OS_CHECK

const osCheck = (state = new OsCheckRecord(), action) => {
  if (action.type === CHECKED_OS) {
    return state.updateFromAction(action)
  } else {
    return state
  }
}

export default osCheck
