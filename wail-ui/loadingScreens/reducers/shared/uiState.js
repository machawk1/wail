import { INITIAL_LOAD } from '../../constants'
import { UIStateRecord } from '../../records'

const uiState = (state = new UIStateRecord(), action) => {
  switch (action.type) {
    case INITIAL_LOAD.HAVE_UI_STATE:
      return state.progress(action)
    default:
      return state
  }
}

export default uiState
