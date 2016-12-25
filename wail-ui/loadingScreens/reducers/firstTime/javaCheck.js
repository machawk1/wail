import { JavaCheckRecord } from '../../records'
import { JAVA_CHECK } from '../../constants'

const {CHECKED_JAVA} = JAVA_CHECK

const javaCheck = (state = new JavaCheckRecord(), action) => {
  if (action.type === CHECKED_JAVA) {
    return state.updateFromAction(action)
  } else {
    return state
  }
}

export default javaCheck
