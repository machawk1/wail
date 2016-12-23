import { STEP } from '../../constants'

const {NEXT_LOADING_STEP, PREV_LOADING_STEP} = STEP

export default  (state = 0, action) => {
  if (action.type === NEXT_LOADING_STEP) {
    return state + 1
  } else if (action.type === PREV_LOADING_STEP) {
    let ns = state - 1
    return ns >= 0 ? ns : 0
  } else {
    return state
  }
}

