import { JdkDlRecord } from '../../records'
import { JDK_DOWNLOAD } from '../../constants'

const {DL_JDK_PROGRESS, DL_JDK_ERROR, DL_JDK_FINISHED, DL_JDK, DL_JDK_STARTED} = JDK_DOWNLOAD

const jdkDl = (state = new JdkDlRecord(), action) => {
  switch (action.type) {
    case DL_JDK_STARTED:
      return state.started()
    case DL_JDK_PROGRESS:
      return state.progressUpdate(action.stats)
    case DL_JDK_FINISHED:
      return state.finishedNoError()
    case DL_JDK_ERROR:
      return state.finishedError()
    default:
      return state
  }
}

export default jdkDl
