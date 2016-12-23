import { JavaCheckRecord } from '../../records'
import { JAVA_CHECK } from '../../constants'

const {CHECKED_JAVA} = JAVA_CHECK

export default (state = new JavaCheckRecord(), action) => {
  if (action.type === CHECKED_JAVA) {
    return state.updateFromAction(action)
  } else {
    return state
  }
}
